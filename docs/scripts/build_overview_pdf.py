# -*- coding: utf-8 -*-
"""
Builds submission/Jisr_Full_Project_Overview.pdf from REPORT.md, so the overview PDF
and the technical report always say the same thing.

Usage (from the repository root):
    pip install markdown
    python docs/scripts/build_overview_pdf.py

Needs Microsoft Edge or Google Chrome for the PDF step (set BROWSER to its path if it
is not found). Without one, the script writes the HTML and stops; open it in a browser
and print to PDF (A4, background graphics on).
"""

import base64
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[2]
OUT_PDF = ROOT / "submission" / "Jisr_Full_Project_Overview.pdf"
BROWSERS = [
    os.environ.get("BROWSER", ""),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome",
    "chromium",
    "microsoft-edge",
]


def slug(value: str, separator: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def build_html() -> str:
    report = (ROOT / "REPORT.md").read_text(encoding="utf-8").replace("\r\n", "\n")
    # The cover carries the title block, so drop the report's own H1 and the quote block under it.
    report = re.sub(r"\A# [^\n]*\n\n(?:>[^\n]*\n)+\n---\n", "", report)
    # Python-Markdown nests lists only at 4 spaces; the report uses 3.
    report = re.sub(r"(?m)^   - ", "    - ", report)
    body = markdown.markdown(
        report,
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
        extension_configs={"toc": {"slugify": slug}},
    )
    logo = base64.b64encode((ROOT / "assets" / "icon.png").read_bytes()).decode()
    return TEMPLATE.replace("{{LOGO}}", logo).replace("{{BODY}}", body)


def find_browser() -> str | None:
    for candidate in BROWSERS:
        if candidate and (Path(candidate).is_file() or shutil.which(candidate)):
            return candidate
    return None


def main() -> None:
    work = Path(tempfile.mkdtemp(prefix="jisr-overview-"))
    html_path = work / "overview.html"
    html_path.write_text(build_html(), encoding="utf-8")
    browser = find_browser()
    if browser is None:
        print(f"No Edge or Chrome found. Open {html_path} in a browser and print it to PDF.")
        sys.exit(1)
    subprocess.run(
        [
            browser,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--virtual-time-budget=15000",  # time for the web fonts to load
            f"--print-to-pdf={OUT_PDF}",
            html_path.as_uri(),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"Saved {OUT_PDF.relative_to(ROOT)}")


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Jisr — Full Project Overview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Readex+Pro:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #2a2118;
    --brown: #392304;
    --muted: #6b5e50;
    --line: #e4dccf;
    --paper: #ffffff;
    --tint: #faf6ef;
    --green: #2f6b4f;
  }
  @page {
    size: A4;
    margin: 16mm;
    @bottom-center {
      content: "Jisr — Full Project Overview · " counter(page) " / " counter(pages);
      font-family: 'Segoe UI', sans-serif;
      font-size: 7.5pt;
      color: #8a7d6f;
    }
  }
  html { background: var(--paper); }
  body {
    margin: 0;
    color: var(--ink);
    font-family: 'IBM Plex Sans Arabic', 'Segoe UI', sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
  }
  .cover {
    height: 255mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    page-break-after: always;
  }
  .cover img { width: 62mm; height: 62mm; border-radius: 22%; border: 1px solid #dfe5e3; }
  .cover h1 { font-family: 'Readex Pro', sans-serif; color: var(--brown); font-size: 30pt; margin: 10mm 0 2mm; }
  .cover .sub { font-size: 14pt; color: var(--muted); margin: 0 0 12mm; }
  .cover dl { display: grid; grid-template-columns: auto auto; gap: 2mm 6mm; text-align: left; font-size: 10.5pt; }
  .cover dt { color: var(--muted); }
  .cover dd { margin: 0; }
  .cover .note { margin-top: 14mm; font-size: 9pt; color: var(--muted); max-width: 130mm; }
  h2, h3 { font-family: 'Readex Pro', sans-serif; color: var(--brown); line-height: 1.3; }
  h2 { font-size: 16pt; margin: 9mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 1.5px solid var(--line); page-break-after: avoid; }
  h3 { font-size: 12pt; margin: 6mm 0 2mm; page-break-after: avoid; }
  h2#contents + ol { columns: 2; }
  p, li { orphans: 3; widows: 3; }
  a { color: var(--green); text-decoration: none; }
  hr { display: none; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0 4mm; font-size: 9.2pt; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid var(--line); padding: 1.6mm 2.2mm; vertical-align: top; text-align: left; }
  th { background: var(--tint); color: var(--brown); font-weight: 600; }
  code { font-family: Consolas, 'Cascadia Mono', monospace; font-size: 8.8pt; background: var(--tint); padding: 0 1mm; border-radius: 1mm; }
  pre { background: var(--tint); border: 1px solid var(--line); border-radius: 2mm; padding: 3mm; overflow: hidden; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 7.6pt; line-height: 1.35; }
  blockquote { margin: 3mm 0; padding: 2mm 4mm; border-left: 3px solid var(--brown); background: var(--tint); }
  blockquote p { margin: 1mm 0; }
</style>
</head>
<body>
<section class="cover">
  <img src="data:image/png;base64,{{LOGO}}" alt="Jisr logo">
  <h1>Jisr (جِسر)</h1>
  <p class="sub">Full Project Overview — Technical Report</p>
  <dl>
    <dt>Project</dt><dd>An AI writing companion that helps a young person draft a first message to a real person</dd>
    <dt>Event</dt><dd>Ai4LY National Codathon 2026, Libya Artificial Intelligence Forum</dd>
    <dt>Team</dt><dd>Mohamed Thabet (Team Leader), Rayan, Muatz, Shima</dd>
    <dt>Date</dt><dd>8 October 2026</dd>
  </dl>
  <p class="note">Generated from <code>REPORT.md</code> by <code>docs/scripts/build_overview_pdf.py</code>, so this document and the report say the same thing. Every figure in it comes from a command listed in Section 14 or in <code>safety/evidence.md</code>.</p>
</section>
<main>
{{BODY}}
</main>
</body>
</html>
"""

if __name__ == "__main__":
    main()
