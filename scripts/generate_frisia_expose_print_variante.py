from __future__ import annotations

import base64
import html
import mimetypes
import textwrap
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "web" / "docs" / "generated-expose"
ASSET_DIR = DOCS_DIR / "assets"
TMP_ASSET_DIR = ROOT / "tmp" / "expose_src" / "word" / "media"
HTML_PATH = DOCS_DIR / "frisia-expose-haxtum-druckfassung-premium.html"
DOCX_PATH = DOCS_DIR / "Frisia-Expose-Haxtum-Druckfassung-Premium.docx"


PROPERTY = {
    "title": "Kernsanierter Bungalow mit Wintergarten und ruhiger Wohnlage in Haxtum",
    "subtitle": "Ein hochwertig modernisiertes Zuhause für Käufer, die Komfort, Privatsphäre und klare Qualität suchen.",
    "eyebrow": "Exposé | Kaufobjekt in Aurich-Haxtum",
    "address": "Am Alten Tief 1, 26605 Aurich",
    "price": "399.000 EUR",
    "commission": "Käuferprovision 3,57 % inkl. MwSt. des beurkundeten Kaufpreises",
    "facts": [
        ("Wohnfläche", "ca. 130 m²"),
        ("Grundstück", "ca. 633 m²"),
        ("Zimmer", "3"),
        ("Nutzfläche", "ca. 150 m²"),
        ("Terrasse", "ca. 80 m²"),
        ("Zustand", "umfassend modernisiert"),
    ],
    "core_claim": (
        "Dieser Bungalow richtet sich vor allem an anspruchsvolle Eigennutzer: an Paare, "
        "Best Ager oder Einzelpersonen mit gehobenem Anspruch, die ebenerdiges Wohnen, "
        "technisch solide Substanz und einen repräsentativen, aber pflegeleichten Rahmen suchen."
    ),
    "intro": [
        "Die Immobilie verbindet die Ruhe einer gefragten Auricher Wohnlage mit einer Modernisierung, die nicht bei Oberflächen stehen geblieben ist. Viele zentrale Gewerke wurden erneuert oder neu aufgebaut und schaffen ein Wohnumfeld, das im Alltag sofort funktioniert.",
        "Der Grundriss ist klar und souverän lesbar. Drei Zimmer, zwei Bäder, ein separates Gäste-WC und der großzügige Wintergarten eröffnen eine Wohnform, die sowohl für entspanntes Alltagsleben als auch für den Empfang von Gästen ausgelegt ist.",
        "Gerade für Käufer, die nicht mehr sanieren möchten, sondern ein gepflegtes Haus mit nachvollziehbarer Investitionstiefe suchen, ist dieses Objekt interessant. Die Kombination aus Privatsphäre, Außenbezug und Haustechnik hebt es deutlich von vielen Vergleichsangeboten ab.",
    ],
    "buyer_fit": [
        "Ideal für ein Paar, das aus einem größeren Haus in eine komfortablere und besser steuerbare Wohnform wechseln möchte.",
        "Passend für Käufer mit Wunsch nach hochwertigem Eigennutz statt spekulativer Anlage.",
        "Attraktiv für Menschen, die Wohnen auf einer Ebene, Wintergarten, Terrasse und geschützten Garten höher gewichten als maximale Zimmerzahl.",
    ],
    "highlights": [
        "Wintergarten von Pollmann & Renken als hochwertige Erweiterung des Wohnbereichs.",
        "Wolf-Heizungsanlage mit 800-Liter-Schichtenspeicher, Solarthermie und App-Steuerung.",
        "Fußbodenheizung in allen Räumen mit digital geregelten Thermostaten.",
        "Umfassende Erneuerungen an Fenstern, Dämmung, Elektrik, Wasserleitungen und Innenausbau.",
        "Vollständig eingefriedetes Grundstück mit großzügiger Sonnenterrasse.",
        "Alarmanlage, Videoüberwachung und elektrisches Garagentor.",
    ],
    "detail_rows": [
        ("Objektnummer", "FI26153"),
        ("Objektart", "Haus | Bungalow"),
        ("Kaufpreis", "399.000 EUR"),
        ("Wohnfläche", "ca. 130 m²"),
        ("Nutzfläche", "ca. 150 m²"),
        ("Grundstück", "ca. 633 m²"),
        ("Zimmer", "3"),
        ("Schlafzimmer", "1"),
        ("Badezimmer", "2"),
        ("Gäste-WC", "ja"),
        ("Terrassenfläche", "ca. 80 m²"),
        ("Ausstattung", "gehoben"),
        ("Objektzustand", "saniert"),
        ("Heizungsart", "Fußbodenheizung"),
        ("Energieträger", "Gas"),
    ],
    "location": [
        "Haxtum gehört zu den nachgefragten Wohnlagen in Aurich. Die Lage ist angenehm zurückgenommen, zugleich bleiben Einkauf, medizinische Versorgung, Stadtzentrum und alltägliche Wege gut erreichbar.",
        "Für die anvisierte Käufergruppe ist genau diese Balance entscheidend: nicht ländlich isoliert, aber deutlich ruhiger und privater als viele innerstädtische Alternativen.",
        "Zusätzliche Qualität entsteht durch die Nähe zu Freiräumen und zur ostfriesischen Landschaft. Das Haus spricht damit Käufer an, die einen klaren Wohnrückzugsort suchen, ohne auf Anbindung zu verzichten.",
    ],
    "renovations": [
        ("2021", "Neugestaltung der Terrasse"),
        ("2020", "Videoüberwachung, Dachausbesserung, vollständige Einzäunung"),
        ("2019", "Verbreiterung der Auffahrt, elektrisches Garagentor"),
        ("2018", "Neue Innentüren, Ausbau des Obergeschosses"),
        ("2017", "Fenster, Heizung, Wintergarten, Fußbodenheizung, Dämmung, Bad, Gäste-WC, Hausautomation"),
        ("2016", "Abwasserleitungen, Elektrik, Wasserleitungen, Grundriss / Trockenbau"),
    ],
    "energy": [
        ("Energieausweis", "Verbrauchsausweis"),
        ("Ausgestellt", "29.06.2022"),
        ("Gültig bis", "30.06.2032"),
        ("Energieeffizienzklasse", "D"),
        ("Energieverbrauch", "129,50 kWh/(m²*a)"),
        ("Warmwasser enthalten", "ja"),
        ("Baujahr Anlagentechnik", "2017"),
    ],
    "contact": {
        "company": "Frisia Immobilien GmbH",
        "name": "Sebastian Munzig",
        "role": "Geschäftsführender Gesellschafter",
        "qualifications": "Immobilienmakler (IHK) | DEKRA-zertifizierter Sachverständiger für Immobilienbewertung D1",
        "street": "Oldersumer Straße 150",
        "city": "26605 Aurich",
        "phone": "04941 986770-0",
        "mobile": "0152 22100100",
        "mail": "sebastian.munzig@frisia-immobilien.de",
        "web": "www.frisia-immobilien.de",
    },
}


ASSET_MAP = {
    "hero": "template_document.xml_img1.jpg",
    "gallery1": "template_document.xml_img2.jpg",
    "gallery2": "template_document.xml_img3.jpg",
    "gallery3": "template_document.xml_img4.jpg",
    "gallery4": "template_document.xml_img5.jpg",
    "gallery5": "template_document.xml_img6.jpg",
    "gallery6": "template_document.xml_img7.jpg",
    "gallery7": "template_document.xml_img8.jpg",
    "gallery8": "template_document.xml_img9.jpg",
    "map": "template_document.xml_img14.png",
    "plan1": "template_document.xml_img13.png",
    "plan2": "template_document.xml_img15.png",
    "plan3": "template_document.xml_img16.png",
    "plan4": "template_document.xml_img18.png",
    "logo": "template_header1.xml_img20.png",
}


def h(value: str) -> str:
    return html.escape(value)


def get_assets() -> dict[str, Path]:
    assets: dict[str, Path] = {}
    for key, filename in ASSET_MAP.items():
        candidates = [ASSET_DIR / filename, TMP_ASSET_DIR / filename]
        path = next((candidate for candidate in candidates if candidate.exists()), None)
        if path is None:
            raise FileNotFoundError(f"Fehlendes Asset: {filename}")
        assets[key] = path
    return assets


def render_paragraphs(items: list[str]) -> str:
    return "".join(f"<p>{h(item)}</p>" for item in items)


def render_detail_rows(rows: list[tuple[str, str]]) -> str:
    return "".join(
        f"""
        <tr>
          <td class="data-label">{h(label)}</td>
          <td class="data-value">{h(value)}</td>
        </tr>
        """
        for label, value in rows
    )


def render_bullets(items: list[str], css_class: str = "bullet-list") -> str:
    return f'<ul class="{css_class}">' + "".join(f"<li>{h(item)}</li>" for item in items) + "</ul>"


def render_renovations() -> str:
    return "".join(
        f"""
        <tr>
          <td class="timeline-year">{h(year)}</td>
          <td class="timeline-text">{h(text)}</td>
        </tr>
        """
        for year, text in PROPERTY["renovations"]
    )


def render_photo_grid() -> str:
    rows = [("gallery1", "gallery2"), ("gallery3", "gallery4"), ("gallery5", "gallery6"), ("gallery7", "gallery8")]
    return "".join(
        f"""
        <tr>
          <td class="media-cell"><img src="cid:{left}" class="gallery-image" alt=""></td>
          <td class="media-cell"><img src="cid:{right}" class="gallery-image" alt=""></td>
        </tr>
        """
        for left, right in rows
    )


def render_plan_grid() -> str:
    rows = [("plan1", "plan2"), ("plan3", "plan4")]
    return "".join(
        f"""
        <tr>
          <td class="media-cell"><img src="cid:{left}" class="plan-image" alt=""></td>
          <td class="media-cell"><img src="cid:{right}" class="plan-image" alt=""></td>
        </tr>
        """
        for left, right in rows
    )


def build_html() -> str:
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
              margin: 1.35cm 1.35cm 1.45cm 1.35cm;
            }}
            body {{
              margin: 0;
              font-family: "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif;
              color: #29323A;
              font-size: 10.5pt;
              line-height: 1.5;
              background: #FFFFFF;
            }}
            p {{
              margin: 0 0 9pt 0;
            }}
            table {{
              width: 100%;
              border-collapse: collapse;
            }}
            .page-break {{
              page-break-before: always;
            }}
            .cover {{
              border: 1px solid #D7CCBE;
              padding: 14pt;
              background: #FBF8F2;
            }}
            .hero-image {{
              width: 100%;
              display: block;
              border-radius: 16pt;
            }}
            .cover-panel {{
              margin-top: 14pt;
              border: 1px solid #D9CDBB;
              background: #FFFFFF;
              padding: 18pt 20pt;
            }}
            .eyebrow {{
              color: #6A5742;
              text-transform: uppercase;
              letter-spacing: 1.6px;
              font-size: 8pt;
              font-weight: 700;
              margin-bottom: 8pt;
            }}
            .title {{
              font-family: "Palatino Linotype", Georgia, serif;
              color: #182936;
              font-size: 24pt;
              line-height: 1.08;
              font-weight: 700;
              margin: 0 0 10pt 0;
            }}
            .subtitle {{
              color: #50606E;
              font-size: 11pt;
              margin-bottom: 14pt;
            }}
            .address {{
              color: #3E4953;
              margin-bottom: 10pt;
            }}
            .price-box {{
              width: 100%;
              margin-top: 8pt;
            }}
            .price-cell {{
              width: 50%;
              vertical-align: top;
            }}
            .price-label {{
              color: #6A5742;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              font-size: 7.8pt;
              font-weight: 700;
              margin-bottom: 4pt;
            }}
            .price-value {{
              font-family: "Palatino Linotype", Georgia, serif;
              color: #182936;
              font-size: 21pt;
              font-weight: 700;
            }}
            .commission {{
              font-size: 8.5pt;
              color: #61707B;
              text-align: right;
            }}
            .fact-grid {{
              margin-top: 16pt;
            }}
            .fact-card {{
              width: 33.33%;
              padding: 8pt 6pt;
            }}
            .fact-inner {{
              border: 1px solid #D8CCBC;
              background: #FFFFFF;
              padding: 12pt 12pt 11pt 12pt;
              min-height: 56pt;
            }}
            .fact-label {{
              color: #6A5742;
              text-transform: uppercase;
              letter-spacing: 1.1px;
              font-size: 7.5pt;
              font-weight: 700;
              margin-bottom: 5pt;
            }}
            .fact-value {{
              color: #182936;
              font-size: 12.6pt;
              font-weight: 700;
            }}
            .section {{
              margin-top: 16pt;
              border: 1px solid #DDD3C6;
              padding: 18pt 20pt;
              background: #FFFFFF;
            }}
            .section-title {{
              font-family: "Palatino Linotype", Georgia, serif;
              color: #182936;
              font-size: 18pt;
              line-height: 1.12;
              font-weight: 700;
              margin: 0 0 10pt 0;
            }}
            .lead-box {{
              border-left: 4pt solid #B79A74;
              background: #FBF8F3;
              padding: 12pt 14pt;
              margin-top: 10pt;
              color: #34424D;
            }}
            .bullet-list {{
              margin: 0;
              padding-left: 16pt;
            }}
            .bullet-list li {{
              margin-bottom: 6pt;
            }}
            .two-col td {{
              vertical-align: top;
            }}
            .col-left {{
              width: 57%;
              padding-right: 16pt;
            }}
            .col-right {{
              width: 43%;
            }}
            .map-image {{
              width: 100%;
              display: block;
              border: 1px solid #DDD3C6;
              border-radius: 14pt;
            }}
            .data-table td {{
              border-bottom: 1px solid #E7E0D6;
              padding: 7pt 0;
              vertical-align: top;
            }}
            .data-label {{
              width: 38%;
              color: #687681;
              padding-right: 10pt;
            }}
            .data-value {{
              color: #182936;
              font-weight: 600;
            }}
            .timeline {{
              margin-top: 4pt;
            }}
            .timeline td {{
              border-bottom: 1px solid #E7E0D6;
              padding: 7pt 0;
              vertical-align: top;
            }}
            .timeline-year {{
              width: 16%;
              color: #6A5742;
              font-weight: 700;
              padding-right: 10pt;
            }}
            .timeline-text {{
              color: #29323A;
            }}
            .quiet-note {{
              margin-top: 12pt;
              font-size: 8.7pt;
              color: #65727B;
            }}
            .media-table {{
              margin-top: 8pt;
            }}
            .media-cell {{
              width: 50%;
              padding: 8pt 6pt;
              vertical-align: top;
            }}
            .gallery-image {{
              width: 100%;
              display: block;
              border-radius: 14pt;
            }}
            .plan-image {{
              width: 100%;
              display: block;
              border: 1px solid #DDD3C6;
              border-radius: 12pt;
              background: #FFFFFF;
            }}
            .contact-table td {{
              vertical-align: top;
            }}
            .logo-cell {{
              width: 34%;
              padding-right: 18pt;
            }}
            .contact-logo {{
              width: 120pt;
              display: block;
            }}
            .contact-copy {{
              width: 66%;
            }}
            .small {{
              font-size: 8.8pt;
              color: #61707B;
            }}
            .footer-note {{
              font-size: 8.6pt;
              color: #65727B;
            }}
          </style>
        </head>
        <body>
          <div class="cover">
            <img src="cid:hero" class="hero-image" alt="">

            <div class="cover-panel">
              <div class="eyebrow">{h(PROPERTY["eyebrow"])}</div>
              <div class="title">{h(PROPERTY["title"])}</div>
              <div class="subtitle">{h(PROPERTY["subtitle"])}</div>
              <div class="address">{h(PROPERTY["address"])}</div>

              <table class="price-box">
                <tr>
                  <td class="price-cell">
                    <div class="price-label">Kaufpreis</div>
                    <div class="price-value">{h(PROPERTY["price"])}</div>
                  </td>
                  <td class="price-cell commission">{h(PROPERTY["commission"])}</td>
                </tr>
              </table>

              <table class="fact-grid">
                <tr>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Wohnfläche</div><div class="fact-value">ca. 130 m²</div></div></td>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Grundstück</div><div class="fact-value">ca. 633 m²</div></div></td>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Zimmer</div><div class="fact-value">3</div></div></td>
                </tr>
                <tr>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Nutzfläche</div><div class="fact-value">ca. 150 m²</div></div></td>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Terrasse</div><div class="fact-value">ca. 80 m²</div></div></td>
                  <td class="fact-card"><div class="fact-inner"><div class="fact-label">Zustand</div><div class="fact-value">modernisiert</div></div></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="section">
            <div class="eyebrow">Positionierung</div>
            <div class="section-title">Ein Haus für Käufer, die lieber Qualität erwerben als Baustellen übernehmen.</div>
            <div class="lead-box">{h(PROPERTY["core_claim"])}</div>
            <div style="margin-top:12pt;">{render_paragraphs(PROPERTY["intro"])}</div>
          </div>

          <div class="section">
            <div class="eyebrow">Zielgruppen-Fit</div>
            <div class="section-title">Warum dieses Objekt gerade für komfortorientierte Eigennutzer überzeugt</div>
            {render_bullets(PROPERTY["buyer_fit"])}
          </div>

          <div class="section">
            <div class="eyebrow">Ausstattung</div>
            <div class="section-title">Die Substanz und der Komfort sprechen für sich</div>
            {render_bullets(PROPERTY["highlights"])}
          </div>

          <div class="page-break"></div>

          <div class="section">
            <div class="eyebrow">Objektdaten</div>
            <div class="section-title">Kennzahlen und harte Fakten</div>
            <table class="data-table">
              {render_detail_rows(PROPERTY["detail_rows"])}
            </table>
          </div>

          <div class="section">
            <div class="eyebrow">Lage</div>
            <div class="section-title">Haxtum bietet die Art von Ruhe, die im Alltag tatsächlich zählt</div>
            <table class="two-col">
              <tr>
                <td class="col-left">
                  {render_paragraphs(PROPERTY["location"])}
                </td>
                <td class="col-right">
                  <img src="cid:map" class="map-image" alt="">
                </td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="eyebrow">Modernisierung</div>
            <div class="section-title">Nachvollziehbare Investitionen statt bloßer Kosmetik</div>
            <table class="timeline">
              {render_renovations()}
            </table>
          </div>

          <div class="section">
            <div class="eyebrow">Energie & Technik</div>
            <div class="section-title">Wichtige Angaben zur technischen Basis</div>
            <table class="data-table">
              {render_detail_rows(PROPERTY["energy"])}
            </table>
            <div class="quiet-note">
              Für viele Käufer ist nicht allein die Effizienzklasse entscheidend, sondern das Zusammenspiel aus modernisierter Anlagentechnik, nachvollziehbaren Investitionen und einem stimmigen Gesamtzustand. Genau darin liegt hier die Stärke.
            </div>
          </div>

          <div class="page-break"></div>

          <div class="section">
            <div class="eyebrow">Bildstrecke</div>
            <div class="section-title">Eindrücke aus Wohnbereich, Wintergarten und Außenraum</div>
            <table class="media-table">
              {render_photo_grid()}
            </table>
          </div>

          <div class="page-break"></div>

          <div class="section">
            <div class="eyebrow">Grundrisse & Unterlagen</div>
            <div class="section-title">Zur räumlichen Einordnung der Immobilie</div>
            <table class="media-table">
              {render_plan_grid()}
            </table>
          </div>

          <div class="section">
            <div class="eyebrow">Ansprechpartner</div>
            <div class="section-title">Frisia Immobilien</div>
            <table class="contact-table">
              <tr>
                <td class="logo-cell">
                  <img src="cid:logo" class="contact-logo" alt="Frisia Immobilien">
                </td>
                <td class="contact-copy">
                  <p><strong>{h(PROPERTY["contact"]["name"])}</strong><br>{h(PROPERTY["contact"]["role"])}</p>
                  <p class="small">{h(PROPERTY["contact"]["qualifications"])}</p>
                  <p>{h(PROPERTY["contact"]["company"])}<br>{h(PROPERTY["contact"]["street"])}<br>{h(PROPERTY["contact"]["city"])}</p>
                  <p>Telefon: {h(PROPERTY["contact"]["phone"])}<br>Mobil: {h(PROPERTY["contact"]["mobile"])}<br>E-Mail: {h(PROPERTY["contact"]["mail"])}<br>Web: {h(PROPERTY["contact"]["web"])}</p>
                </td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="eyebrow">Hinweis</div>
            <div class="footer-note">
              Dieses Exposé dient ausschließlich der Vorabinformation. Alle Angaben beruhen auf Informationen des Eigentümers bzw. Dritter; eine Haftung für Richtigkeit und Vollständigkeit wird daher nicht übernommen. Maßgeblich sind ausschließlich die Vereinbarungen im notariellen Kaufvertrag. Irrtum und Zwischenverkauf bleiben vorbehalten.
            </div>
          </div>
        </body>
        </html>
        """
    )


def build_mht(html_content: str, assets: dict[str, Path]) -> bytes:
    boundary = "----=_NextPart_FrisiaExposePrint_000_0000"
    parts = [
        "MIME-Version: 1.0",
        f'Content-Type: multipart/related; type="text/html"; boundary="{boundary}"',
        "",
        f"--{boundary}",
        'Content-Type: text/html; charset="utf-8"',
        "Content-Transfer-Encoding: 8bit",
        "Content-Location: file:///C:/frisia-expose-print.html",
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
    assets = get_assets()
    html_content = build_html()
    HTML_PATH.write_text(html_content, encoding="utf-8")
    build_docx_package(build_mht(html_content, assets))
    print(DOCX_PATH)


if __name__ == "__main__":
    main()
