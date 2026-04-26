from __future__ import annotations

import html
import mimetypes
import shutil
import textwrap
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPOSE_DIR = Path("/Users/frisia01/Desktop/Expose Frisia")
SOURCE_DOCX = EXPOSE_DIR / "Vorlagen" / "Exposé Frisia Immoblien v0.1 (1).docx"
OUTPUT_DIR = EXPOSE_DIR / "generated-expose"
ASSET_DIR = OUTPUT_DIR / "assets"
HTML_PATH = OUTPUT_DIR / "frisia-expose-haxtum-website-stil.html"
DOCX_PATH = OUTPUT_DIR / "Frisia-Expose-Haxtum-Website-Stil.docx"


PROPERTY = {
    "title": "Kernsanierter Bungalow mit Solarthermie und Sonnenterrasse in Haxtum, Aurich",
    "eyebrow": "Kaufobjekt in Aurich",
    "type": "Bungalow",
    "city_badge": "Aurich",
    "price": "399.000 €",
    "address": "Am Alten Tief 1, 26605 Aurich",
    "commission": "Käuferprovision 3,57 % inkl. MwSt. des beurkundeten Kaufpreises",
    "facts": [
        ("Wohnfläche", "ca. 130 m²"),
        ("Grundstück", "ca. 633 m²"),
        ("Zimmer", "3"),
        ("Baujahr", "2017 / modernisiert"),
    ],
    "detail_rows": [
        ("Objektnummer", "FI26153"),
        ("Kategorie", "Kauf – Haus"),
        ("Unterkategorie", "Bungalow"),
        ("Objektzustand", "Saniert"),
        ("Ausstattung", "Gehoben"),
        ("Zimmer", "3"),
        ("Schlafzimmer", "1"),
        ("Badezimmer", "2"),
        ("Wohnfläche", "ca. 130 m²"),
        ("Nutzfläche", "ca. 150 m²"),
        ("Grundstück", "ca. 633 m²"),
        ("Terrassenfläche", "ca. 80 m²"),
        ("Heizungsart", "Fußbodenheizung"),
        ("Energieträger", "Gas"),
        ("Energieeffizienzklasse", "D"),
        ("Energiekennwert", "129,50 kWh/(m²*a)"),
    ],
    "highlights": [
        "Umfassend modernisiert mit hochwertiger technischer und baulicher Erneuerung.",
        "Wintergarten von Pollmann & Renken als ganzjährig nutzbare Erweiterung des Wohnbereichs.",
        "Wolf-Heizungsanlage mit 800-Liter-Schichtenspeicher, Solarthermie und App-Steuerung.",
        "Fußbodenheizung in allen Räumen mit digital gesteuerten Thermostaten.",
        "Vollständig eingefriedetes Grundstück mit gepflegtem Garten und großzügiger Terrasse.",
        "Alarmanlage, Videoüberwachung und elektrisches Garagentor für zusätzlichen Komfort.",
    ],
    "description": [
        "Dieser gepflegte Bungalow in Aurich überzeugt mit einem klar strukturierten Grundriss, einer hochwertigen Materialauswahl und einer Modernisierung, die konsequent auf Komfort, Energieeffizienz und Alltagstauglichkeit ausgerichtet wurde.",
        "Das Raumangebot umfasst drei Zimmer, ein Schlafzimmer, zwei Bäder, ein separates Gäste-WC sowie eine hochwertig ausgestattete Einbauküche mit Gas- und Induktionsfeld. Besonders prägend ist der großzügige Wintergarten, der Wohnen und Garten stimmig miteinander verbindet.",
        "In den vergangenen Jahren wurden Fenster, Heizungsanlage, Dämmung, Elektrik, Wasserleitungen, Bodenaufbauten, Türen und große Teile der Gebäudehülle umfassend erneuert. Dadurch entsteht ein Objekt, das nicht nur gepflegt wirkt, sondern technisch und optisch auf einem sehr soliden Niveau steht.",
    ],
    "location": [
        "Haxtum zählt zu den gefragten Wohnlagen in Aurich, weil sich ruhiges Wohnen und kurze Wege hier außergewöhnlich gut verbinden. Einkaufsmöglichkeiten, Schulen, Kindergärten, medizinische Versorgung und weitere Einrichtungen des täglichen Bedarfs liegen im nahen Umfeld.",
        "Das Stadtzentrum von Aurich ist in wenigen Minuten erreichbar. Gleichzeitig profitiert die Lage von der Nähe zur ostfriesischen Landschaft, zu weitläufigen Grünräumen und zur gesamten Region rund um das Wattenmeer.",
    ],
    "renovations": [
        "2021: Neugestaltung der Terrasse",
        "2020: Video-Überwachung, Dachausbesserung, vollständige Einzäunung",
        "2019: Verbreiterung der Auffahrt, elektrisches Garagentor",
        "2018: Neue Innentüren, Ausbau des Obergeschosses",
        "2017: Fenster, Heizung, Wintergarten, Fußbodenheizung, Dämmung, Bad, Gäste-WC, Hausautomation",
        "2016: Abwasserleitungen, Elektrik, Wasserleitungen, Grundriss / Trockenbau",
    ],
    "energy": [
        ("Energieausweis", "Verbrauchsausweis"),
        ("Ausgestellt", "29.06.2022"),
        ("Gültig bis", "30.06.2032"),
        ("Energieeffizienzklasse", "D"),
        ("Energieverbrauch", "129,50 kWh/(m²*a)"),
        ("Warmwasser enthalten", "Ja"),
        ("Baujahr Anlagentechnik", "2017"),
    ],
    "contact": {
        "company": "Frisia Immobilien GmbH",
        "name": "Sebastian Munzig",
        "role": "Geschäftsführender Gesellschafter",
        "qualifications": "Immobilienmakler (IHK) · DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1",
        "street": "Oldersumer Straße 150",
        "city": "26605 Aurich",
        "phone": "04941 986770-0",
        "mobile": "0152 22100100",
        "mail": "sebastian.munzig@frisia-immobilien.de",
        "web": "www.frisia-immobilien.de",
    },
}


def ensure_dirs() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if ASSET_DIR.exists():
        shutil.rmtree(ASSET_DIR)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)


def extract_assets() -> dict[str, Path]:
    with zipfile.ZipFile(SOURCE_DOCX) as archive:
        members = [name for name in archive.namelist() if name.startswith("word/media/")]
        archive.extractall(OUTPUT_DIR, members)

    media_dir = OUTPUT_DIR / "word" / "media"

    selected = {
        "hero": "template_document.xml_img1.jpg",
        "gallery1": "template_document.xml_img2.jpg",
        "gallery2": "template_document.xml_img3.jpg",
        "gallery3": "template_document.xml_img4.jpg",
        "gallery4": "template_document.xml_img5.jpg",
        "gallery5": "template_document.xml_img6.jpg",
        "gallery6": "template_document.xml_img7.jpg",
        "gallery7": "template_document.xml_img8.jpg",
        "gallery8": "template_document.xml_img9.jpg",
        "map": "template_document.xml_img12.png",
        "plan1": "template_document.xml_img14.png",
        "plan2": "template_document.xml_img15.png",
        "plan3": "template_document.xml_img16.png",
        "plan4": "template_document.xml_img17.png",
        "logo": "template_header1.xml_img18.png",
    }

    copied: dict[str, Path] = {}
    for key, filename in selected.items():
        source = media_dir / filename
        target = ASSET_DIR / filename
        shutil.copy2(source, target)
        copied[key] = target

    shutil.rmtree(OUTPUT_DIR / "word", ignore_errors=True)
    return copied


def h(value: str) -> str:
    return html.escape(value)


def fact_cards() -> str:
    cards = []
    for label, value in PROPERTY["facts"]:
        cards.append(
            f"""
            <td class="fact-card">
              <div class="fact-label">{h(label)}</div>
              <div class="fact-value">{h(value)}</div>
            </td>
            """
        )
    return "<tr>" + "".join(cards) + "</tr>"


def detail_table(rows: list[tuple[str, str]]) -> str:
    parts = []
    for label, value in rows:
        parts.append(
            f"""
            <tr>
              <td class="detail-label">{h(label)}</td>
              <td class="detail-value">{h(value)}</td>
            </tr>
            """
        )
    return "".join(parts)


def bullet_list(items: list[str], cls: str = "bullet-list") -> str:
    rendered = "".join(f"<li>{h(item)}</li>" for item in items)
    return f'<ul class="{cls}">{rendered}</ul>'


def paragraph_block(items: list[str]) -> str:
    return "".join(f"<p>{h(item)}</p>" for item in items)


def build_html(assets: dict[str, Path]) -> str:
    return textwrap.dedent(
        f"""\
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="utf-8">
          <title>{h(PROPERTY["title"])}</title>
          <style>
            @page {{
              size: A4;
              margin: 1.2cm 1.2cm 1.3cm 1.2cm;
            }}
            body {{
              font-family: "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif;
              color: #42484F;
              font-size: 10.8pt;
              line-height: 1.55;
              margin: 0;
            }}
            p {{
              margin: 0 0 10pt 0;
            }}
            .page-break {{
              page-break-before: always;
            }}
            .eyebrow {{
              color: #354C52;
              font-size: 8.2pt;
              font-weight: 700;
              letter-spacing: 1.6px;
              text-transform: uppercase;
              margin-bottom: 10pt;
            }}
            .title {{
              color: #1B3040;
              font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
              font-size: 25pt;
              line-height: 1.08;
              font-weight: 700;
              margin: 0 0 12pt 0;
            }}
            .section-title {{
              color: #1B3040;
              font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
              font-size: 19pt;
              line-height: 1.15;
              font-weight: 700;
              margin: 0 0 12pt 0;
            }}
            .muted {{
              color: #5A626A;
            }}
            .badge {{
              display: inline-block;
              border-radius: 999px;
              padding: 6pt 11pt;
              margin: 0 8pt 8pt 0;
              font-size: 8pt;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }}
            .badge-light {{
              background: #F7F8FA;
              color: #1B3040;
              border: 1px solid #D7C8AE;
            }}
            .badge-dark {{
              background: #1B3040;
              color: #FFFFFF;
              border: 1px solid #1B3040;
            }}
            .hero-image {{
              width: 100%;
              height: auto;
              border-radius: 24px;
              display: block;
            }}
            .hero-card {{
              width: 88%;
              margin: -54pt auto 0 auto;
              background: #FFFFFF;
              border: 1px solid #D8CCB8;
              border-radius: 24px;
              padding: 20pt 24pt 18pt 24pt;
            }}
            .address {{
              color: #42484F;
              font-size: 10.5pt;
              margin-bottom: 10pt;
            }}
            .price-label {{
              color: #354C52;
              font-size: 8pt;
              font-weight: 700;
              letter-spacing: 1.2px;
              text-transform: uppercase;
              margin-bottom: 4pt;
            }}
            .price-value {{
              color: #1B3040;
              font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
              font-size: 22pt;
              font-weight: 700;
              margin-bottom: 12pt;
            }}
            .fact-table, .detail-table, .photo-table, .plan-table, .two-col {{
              width: 100%;
              border-collapse: separate;
              border-spacing: 10pt;
            }}
            .fact-card {{
              width: 25%;
              background: #F7F8FA;
              border: 1px solid #E1D8C8;
              border-radius: 18px;
              padding: 14pt 12pt;
              vertical-align: top;
            }}
            .fact-label {{
              color: #354C52;
              font-size: 8pt;
              font-weight: 700;
              letter-spacing: 1.1px;
              text-transform: uppercase;
              margin-bottom: 6pt;
            }}
            .fact-value {{
              color: #1B3040;
              font-size: 13pt;
              font-weight: 700;
            }}
            .section-card {{
              background: #FFFFFF;
              border: 1px solid #DCCFBB;
              border-radius: 24px;
              padding: 20pt 22pt;
              margin-top: 18pt;
            }}
            .detail-label {{
              width: 36%;
              color: #5A626A;
              padding: 8pt 12pt 8pt 0;
              border-bottom: 1px solid #ECE6DC;
              vertical-align: top;
            }}
            .detail-value {{
              color: #1B3040;
              font-weight: 600;
              padding: 8pt 0 8pt 12pt;
              border-bottom: 1px solid #ECE6DC;
              vertical-align: top;
            }}
            .bullet-list {{
              margin: 0;
              padding-left: 17pt;
            }}
            .bullet-list li {{
              margin-bottom: 7pt;
            }}
            .photo-cell, .plan-cell {{
              width: 50%;
              vertical-align: top;
            }}
            .gallery-image {{
              width: 100%;
              height: auto;
              border-radius: 18px;
              display: block;
            }}
            .plan-image {{
              width: 100%;
              height: auto;
              border: 1px solid #E1D8C8;
              border-radius: 16px;
              display: block;
              background: #FFFFFF;
            }}
            .map-image {{
              width: 100%;
              height: auto;
              border-radius: 18px;
              display: block;
              border: 1px solid #E1D8C8;
            }}
            .callout {{
              background: #1B3040;
              color: #FFFFFF;
              border-radius: 22px;
              padding: 18pt 20pt;
            }}
            .callout .section-title {{
              color: #FFFFFF;
              font-size: 18pt;
            }}
            .contact-table {{
              width: 100%;
              border-collapse: collapse;
            }}
            .contact-logo {{
              width: 135pt;
              height: auto;
            }}
            .small {{
              font-size: 9pt;
            }}
            .footer-note {{
              color: #5A626A;
              font-size: 8.8pt;
            }}
          </style>
        </head>
        <body>
          <img src="cid:hero" class="hero-image" alt="">

          <div class="hero-card">
            <div class="eyebrow">{h(PROPERTY["eyebrow"])}</div>
            <span class="badge badge-light">{h(PROPERTY["city_badge"])}</span>
            <span class="badge badge-dark">{h(PROPERTY["type"])}</span>

            <div class="title">{h(PROPERTY["title"])}</div>
            <div class="address">{h(PROPERTY["address"])}</div>
            <div class="price-label">Kaufpreis</div>
            <div class="price-value">{h(PROPERTY["price"])}</div>
            <div class="muted small">{h(PROPERTY["commission"])}</div>
          </div>

          <table class="fact-table">
            {fact_cards()}
          </table>

          <div class="section-card">
            <div class="eyebrow">Objektüberblick</div>
            <div class="section-title">Klare Architektur, technische Substanz und ein stimmiges Wohngefühl.</div>
            {paragraph_block(PROPERTY["description"])}
          </div>

          <div class="section-card">
            <div class="eyebrow">Ausstattung</div>
            <div class="section-title">Die wesentlichen Qualitäten auf einen Blick</div>
            {bullet_list(PROPERTY["highlights"])}
          </div>

          <div class="section-card">
            <div class="eyebrow">Objektdaten</div>
            <div class="section-title">Kennzahlen und Eckdaten</div>
            <table class="detail-table">
              {detail_table(PROPERTY["detail_rows"])}
            </table>
          </div>

          <div class="page-break"></div>

          <div class="section-card">
            <div class="eyebrow">Lage</div>
            <div class="section-title">Haxtum verbindet Ruhe, kurze Wege und Auricher Alltag.</div>
            <table class="two-col">
              <tr>
                <td style="width:58%; vertical-align:top; padding-right:14pt;">
                  {paragraph_block(PROPERTY["location"])}
                </td>
                <td style="width:42%; vertical-align:top;">
                  <img src="cid:map" class="map-image" alt="">
                </td>
              </tr>
            </table>
          </div>

          <div class="section-card">
            <div class="eyebrow">Modernisierung</div>
            <div class="section-title">Sanierungen mit klarer Linie statt kosmetischer Einzelmaßnahmen</div>
            {bullet_list(PROPERTY["renovations"])}
          </div>

          <div class="callout" style="margin-top:18pt;">
            <div class="eyebrow" style="color:#D8C7A4;">Energie</div>
            <div class="section-title">Solide energetische Basis mit moderner Haustechnik</div>
            <table class="detail-table" style="border-spacing:0;">
              {detail_table(PROPERTY["energy"])}
            </table>
          </div>

          <div class="page-break"></div>

          <div class="section-card">
            <div class="eyebrow">Galerie</div>
            <div class="section-title">Ausgewählte Eindrücke aus Haus, Wintergarten und Außenbereich</div>
            <table class="photo-table">
              {photo_grid(assets)}
            </table>
          </div>

          <div class="page-break"></div>

          <div class="section-card">
            <div class="eyebrow">Grundrisse & Pläne</div>
            <div class="section-title">Unterlagen zur räumlichen Einordnung</div>
            <table class="plan-table">
              {plan_grid(assets)}
            </table>
          </div>

          <div class="section-card">
            <div class="eyebrow">Persönlicher Kontakt</div>
            <div class="section-title">Frisia Immobilien</div>
            <table class="contact-table">
              <tr>
                <td style="width:38%; vertical-align:top;">
                  <img src="cid:logo" class="contact-logo" alt="Frisia Immobilien">
                </td>
                <td style="width:62%; vertical-align:top;">
                  <p><strong>{h(PROPERTY["contact"]["name"])}</strong><br>{h(PROPERTY["contact"]["role"])}</p>
                  <p class="small">{h(PROPERTY["contact"]["qualifications"])}</p>
                  <p>{h(PROPERTY["contact"]["company"])}<br>{h(PROPERTY["contact"]["street"])}<br>{h(PROPERTY["contact"]["city"])}</p>
                  <p>Telefon: {h(PROPERTY["contact"]["phone"])}<br>Mobil: {h(PROPERTY["contact"]["mobile"])}<br>E-Mail: {h(PROPERTY["contact"]["mail"])}<br>Web: {h(PROPERTY["contact"]["web"])}</p>
                </td>
              </tr>
            </table>
          </div>

          <div class="section-card">
            <div class="eyebrow">Hinweise</div>
            <div class="footer-note">
              Dieses Exposé dient ausschließlich der Vorabinformation. Alle Angaben beruhen auf Informationen des Eigentümers bzw. Dritter; eine Haftung für Richtigkeit und Vollständigkeit wird daher nicht übernommen. Maßgeblich sind ausschließlich die Vereinbarungen im notariellen Kaufvertrag. Irrtum und Zwischenverkauf bleiben vorbehalten.
            </div>
          </div>
        </body>
        </html>
        """
    )


def photo_grid(assets: dict[str, Path]) -> str:
    rows = [
        ("gallery1", "gallery2"),
        ("gallery3", "gallery4"),
        ("gallery5", "gallery6"),
        ("gallery7", "gallery8"),
    ]
    chunks = []
    for left, right in rows:
        chunks.append(
            f"""
            <tr>
              <td class="photo-cell"><img src="cid:{left}" class="gallery-image" alt=""></td>
              <td class="photo-cell"><img src="cid:{right}" class="gallery-image" alt=""></td>
            </tr>
            """
        )
    return "".join(chunks)


def plan_grid(assets: dict[str, Path]) -> str:
    rows = [
        ("plan1", "plan2"),
        ("plan3", "plan4"),
    ]
    chunks = []
    for left, right in rows:
        chunks.append(
            f"""
            <tr>
              <td class="plan-cell"><img src="cid:{left}" class="plan-image" alt=""></td>
              <td class="plan-cell"><img src="cid:{right}" class="plan-image" alt=""></td>
            </tr>
            """
        )
    return "".join(chunks)


def build_mht(html_content: str, assets: dict[str, Path]) -> bytes:
    import base64

    boundary = "----=_NextPart_FrisiaExpose_000_0000"
    parts = [
        "MIME-Version: 1.0",
        f'Content-Type: multipart/related; type="text/html"; boundary="{boundary}"',
        "",
        f"--{boundary}",
        'Content-Type: text/html; charset="utf-8"',
        "Content-Transfer-Encoding: 8bit",
        "Content-Location: file:///C:/frisia-expose.html",
        "",
        html_content,
        "",
    ]

    image_parts = []
    for key, path in assets.items():
        mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        encoded = base64.encodebytes(path.read_bytes()).decode("ascii")
        image_parts.extend(
            [
                f"--{boundary}",
                f"Content-Type: {mime_type}",
                "Content-Transfer-Encoding: base64",
                f"Content-Location: {key}",
                f"Content-ID: <{key}>",
                "",
                encoded,
                "",
            ]
        )

    image_parts.append(f"--{boundary}--")
    return "\r\n".join(parts + image_parts).encode("utf-8")


def build_docx_package(mht_bytes: bytes) -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/afchunk.mht" ContentType="message/rfc822"/>
</Types>
"""

    root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

    document_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 w15 wp14">
  <w:body>
    <w:altChunk r:id="htmlChunk"/>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

    document_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.mht"/>
</Relationships>
"""

    with zipfile.ZipFile(DOCX_PATH, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", root_rels)
        archive.writestr("word/document.xml", document_xml)
        archive.writestr("word/_rels/document.xml.rels", document_rels)
        archive.writestr("word/afchunk.mht", mht_bytes)


def main() -> None:
    ensure_dirs()
    assets = extract_assets()
    html_content = build_html(assets)
    HTML_PATH.write_text(html_content, encoding="utf-8")
    build_docx_package(build_mht(html_content, assets))
    print(DOCX_PATH)


if __name__ == "__main__":
    main()
