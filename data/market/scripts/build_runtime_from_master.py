from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[3]
IMPORT_DIR = ROOT / "data" / "market" / "import"
MASTER_PATH = ROOT / "data" / "market" / "master" / "extract_frisia_data_master.xlsx"
RUNTIME_PATH = ROOT / "data" / "market" / "runtime" / "leadgen_market_data.json"
WEBSITE_LOCATIONS_PATH = ROOT / "data" / "market" / "runtime" / "website_locations.json"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

STRATEGIC_LOCATION_SLUGS = {"aurich", "ostfriesland", "emden", "leer", "wittmund", "norden"}
WEBSITE_PAGE_TYPES = [
    {"pageType": "immobilienmakler", "prefix": "immobilienmakler"},
    {"pageType": "immobilienbewertung", "prefix": "immobilienbewertung"},
    {"pageType": "haus_verkaufen", "prefix": "haus-verkaufen"},
    {"pageType": "immobilie_verkaufen", "prefix": "immobilie-verkaufen"},
    {"pageType": "immobilienpreise", "prefix": "immobilienpreise"},
    {"pageType": "immobilien", "prefix": "immobilien"},
    {"pageType": "haus_kaufen", "prefix": "haus-kaufen"},
]


NUMERIC_FIELDS = {
    "verkaeufe_anzahl",
    "min_preis_eur_m2",
    "quantil_01_preis_eur_m2",
    "median_preis_eur_m2",
    "durchschnitt_preis_eur_m2",
    "quantil_09_preis_eur_m2",
    "max_preis_eur_m2",
    "delta_vorjahr_median_prozent",
    "efh_median_preis_eur",
    "wohnung_median_preis_eur",
    "tage_am_markt",
    "tage_am_markt_vorjahr",
    "ankaufspreis_best_deal_eur_m2",
    "median_2016",
    "median_2017",
    "median_2018",
    "median_2019",
    "median_2020",
    "median_2021",
    "median_2022",
    "median_2023",
    "median_2024",
    "median_2025",
}


def column_index(reference: str) -> int:
    match = re.match(r"([A-Z]+)", reference)
    if not match:
        return 0
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - 64
    return value - 1


def cell_value(cell: ET.Element) -> object | None:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//m:t", NS))

    value = cell.find("m:v", NS)
    if value is None or value.text is None:
        return None
    return value.text


def read_imv_sheet(path: Path) -> list[dict[str, object]]:
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows = []
    for row in root.findall(".//m:sheetData/m:row", NS):
        cells = {
            column_index(cell.attrib.get("r", "A1")): cell_value(cell)
            for cell in row.findall("m:c", NS)
        }
        if cells:
            rows.append(cells)

    if not rows:
        return []

    header_row = rows[0]
    max_col = max(header_row)
    headers = [str(header_row.get(index) or "") for index in range(max_col + 1)]

    records = []
    for row in rows[1:]:
        record = {
            headers[index]: row.get(index)
            for index in range(len(headers))
            if headers[index]
        }
        if any(value not in (None, "") for value in record.values()):
            records.append(normalize_record(record, path.name))
    return records


def normalize_value(value: object) -> object | None:
    if value == "":
        return None
    return value


def normalize_record(record: dict[str, object], source_file: str) -> dict[str, object]:
    output: dict[str, object] = {}

    for key, raw in record.items():
        value = normalize_value(raw)

        if key in NUMERIC_FIELDS and value is not None:
            try:
                number = float(value)
            except (TypeError, ValueError):
                output[key] = None
                continue

            output[key] = int(number) if number.is_integer() else round(number, 2)
            continue

        if key in {"leadgen_geeignet", "landingpage_geeignet"}:
            output[key] = str(value).strip().lower() == "ja" if value is not None else False
            continue

        output[key] = value

    output["postal_codes"] = [
        part.strip()
        for part in str(output.get("plz_bereiche") or output.get("plz") or "").split(",")
        if part and part.strip()
    ]
    output["_source_xlsx"] = source_file
    return output


def input_files() -> list[Path]:
    files = sorted(IMPORT_DIR.glob("*.xlsx"))
    return files if files else [MASTER_PATH]


def public_slug(record: dict[str, object]) -> str:
    for key in ("ortsteil_slug", "stadt_gemeinde_slug", "landkreis_slug", "region_slug"):
        value = str(record.get(key) or "").strip()
        if value:
            return value
    return ""


def text(record: dict[str, object], key: str) -> str | None:
    value = record.get(key)
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None


def numeric(record: dict[str, object], key: str) -> float:
    value = record.get(key)
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return 0.0


def location_type(record: dict[str, object]) -> str:
    value = text(record, "datensatz_typ")
    if value in {"region", "landkreis", "stadt_gemeinde", "ortsteil"}:
        return value
    return "stadt_gemeinde"


def location_label(record: dict[str, object]) -> str:
    return (
        text(record, "location_label")
        or text(record, "ortsteil")
        or text(record, "stadt_gemeinde")
        or text(record, "landkreis")
        or "Ostfriesland"
    )


def is_website_indexable(record: dict[str, object], slug: str) -> bool:
    if not bool(record.get("landingpage_geeignet")):
        return False

    type_value = location_type(record)
    city_slug = text(record, "stadt_gemeinde_slug") or ""
    strategic = slug in STRATEGIC_LOCATION_SLUGS or city_slug in STRATEGIC_LOCATION_SLUGS
    return numeric(record, "verkaeufe_anzahl") >= 10 or strategic or type_value != "ortsteil"


def build_website_locations(records: list[dict[str, object]]) -> list[dict[str, object]]:
    locations: dict[str, dict[str, object]] = {}

    for record in records:
        slug = public_slug(record)
        if not slug:
            continue

        current = locations.get(slug)
        route_paths = [f"/{page['prefix']}-{slug}" for page in WEBSITE_PAGE_TYPES]
        page_types = [str(page["pageType"]) for page in WEBSITE_PAGE_TYPES]
        website_live = bool(record.get("landingpage_geeignet"))
        leadgen_live = bool(record.get("leadgen_geeignet"))
        sitemap_indexable = is_website_indexable(record, slug)

        if current is None:
            locations[slug] = {
                "location_slug": slug,
                "location_label": location_label(record),
                "location_type": location_type(record),
                "landkreis": text(record, "landkreis"),
                "stadt_gemeinde": text(record, "stadt_gemeinde"),
                "ortsteil": text(record, "ortsteil"),
                "plz": text(record, "plz"),
                "website_live": website_live,
                "leadgen_live": leadgen_live,
                "landingpage_geeignet": website_live,
                "sitemap_indexable": sitemap_indexable,
                "route_count": len(route_paths) if website_live else 0,
                "page_types": page_types if website_live else [],
                "url_paths": route_paths if website_live else [],
                "source_files": [str(record.get("_source_xlsx"))] if record.get("_source_xlsx") else [],
                "record_count": 1,
            }
            continue

        current["website_live"] = bool(current["website_live"] or website_live)
        current["leadgen_live"] = bool(current["leadgen_live"] or leadgen_live)
        current["landingpage_geeignet"] = bool(current["landingpage_geeignet"] or website_live)
        current["sitemap_indexable"] = bool(current["sitemap_indexable"] or sitemap_indexable)
        current["record_count"] = int(current["record_count"]) + 1

        if website_live:
            existing_paths = set(current.get("url_paths") or [])
            existing_paths.update(route_paths)
            current["url_paths"] = sorted(existing_paths)
            current["route_count"] = len(current["url_paths"])
            existing_page_types = set(current.get("page_types") or [])
            existing_page_types.update(page_types)
            current["page_types"] = sorted(existing_page_types)

        source_file = record.get("_source_xlsx")
        if source_file:
            sources = set(current.get("source_files") or [])
            sources.add(str(source_file))
            current["source_files"] = sorted(sources)

        if not current.get("plz") and text(record, "plz"):
            current["plz"] = text(record, "plz")

    return sorted(
        locations.values(),
        key=lambda item: (
            str(item.get("landkreis") or ""),
            str(item.get("stadt_gemeinde") or ""),
            str(item.get("location_type") or ""),
            str(item.get("location_label") or ""),
        ),
    )


def main() -> None:
    records: list[dict[str, object]] = []
    source_files: list[str] = []

    for path in input_files():
        if not path.exists():
            continue
        next_records = read_imv_sheet(path)
        records.extend(next_records)
        source_files.append(path.name)

    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "sourceFile": ", ".join(source_files),
        "recordCount": len(records),
        "records": records,
    }

    RUNTIME_PATH.parent.mkdir(parents=True, exist_ok=True)
    RUNTIME_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    website_locations = build_website_locations(records)
    website_payload = {
        "generatedAt": payload["generatedAt"],
        "sourceFile": payload["sourceFile"],
        "recordCount": len(website_locations),
        "locations": website_locations,
    }
    WEBSITE_LOCATIONS_PATH.write_text(
        json.dumps(website_payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(f"Runtime-Datei geschrieben: {RUNTIME_PATH}")
    print(f"Datensaetze: {len(records)}")
    print(f"Website-Orte: {len(website_locations)}")
    print(f"Website-Orte-Datei: {WEBSITE_LOCATIONS_PATH}")
    print(f"Quellen: {', '.join(source_files)}")


if __name__ == "__main__":
    main()
