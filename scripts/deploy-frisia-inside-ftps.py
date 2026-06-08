#!/usr/bin/env python3
from __future__ import annotations

import os
import socket
from ftplib import FTP_TLS, error_perm
from pathlib import Path


REPO_ROOT = Path.cwd()
ENV_PATH = REPO_ROOT / "inside" / "deploy" / "ftps.env"
OUT_DIR = REPO_ROOT / "inside" / "out"
DATABASE_DIR = REPO_ROOT / "inside" / "database"
RUNTIME_MARKET_DATA = REPO_ROOT / "data" / "market" / "runtime" / "leadgen_market_data.json"
WEBSITE_LOCATIONS_DATA = REPO_ROOT / "data" / "market" / "runtime" / "website_locations.json"
SEO_LOCATION_ENRICHMENTS_DATA = REPO_ROOT / "data" / "market" / "runtime" / "seo_location_enrichments.json"


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        values[key.strip()] = value
    return values


def host_from_value(value: str) -> str:
    return value.replace("ftp://", "").replace("ftps://", "").strip("/").split("/")[0]


def walk_files(path: Path) -> list[Path]:
    return sorted(item for item in path.rglob("*") if item.is_file())


def deployment_files() -> list[tuple[Path, str]]:
    files = [(file, file.relative_to(OUT_DIR).as_posix()) for file in walk_files(OUT_DIR)]
    if DATABASE_DIR.exists():
        for file in walk_files(DATABASE_DIR):
            files.append((file, f"private/database/{file.relative_to(DATABASE_DIR).as_posix()}"))
    if RUNTIME_MARKET_DATA.exists():
        files.append((RUNTIME_MARKET_DATA, "private/import/leadgen_market_data.json"))
    if WEBSITE_LOCATIONS_DATA.exists():
        files.append((WEBSITE_LOCATIONS_DATA, "private/import/website_locations.json"))
    if SEO_LOCATION_ENRICHMENTS_DATA.exists():
        files.append((SEO_LOCATION_ENRICHMENTS_DATA, "private/import/seo_location_enrichments.json"))
    return sorted(files, key=lambda item: item[1])


def ensure_directory(ftps: FTP_TLS, remote_dir: str) -> None:
    if remote_dir in ("", "."):
        return

    current = ftps.pwd()
    try:
        for part in [part for part in remote_dir.split("/") if part]:
            try:
                ftps.mkd(part)
            except error_perm as exc:
                if not str(exc).startswith("550"):
                    raise
            ftps.cwd(part)
    finally:
        ftps.cwd(current)


def upload_file(ftps: FTP_TLS, local_path: Path, remote_path: str) -> None:
    remote_dir = os.path.dirname(remote_path)
    remote_name = os.path.basename(remote_path)
    ensure_directory(ftps, remote_dir)
    current = ftps.pwd()
    try:
        if remote_dir:
            ftps.cwd(remote_dir)
        with local_path.open("rb") as handle:
            ftps.storbinary(f"STOR {remote_name}", handle, blocksize=1024 * 128)
    finally:
        ftps.cwd(current)


def main() -> int:
    if not ENV_PATH.exists():
        raise SystemExit(f"Deploy-Konfiguration fehlt: {ENV_PATH}")
    if not OUT_DIR.exists():
        raise SystemExit("inside/out fehlt. Erst ausfuehren: npm run build:inside")

    env = read_env(ENV_PATH)
    host = host_from_value(env.get("FRISIA_INSIDE_FTPS_HOST", ""))
    user = env.get("FRISIA_INSIDE_FTPS_USER", "")
    password = env.get("FRISIA_INSIDE_FTPS_PASSWORD", "")
    remote_root = env.get("FRISIA_INSIDE_REMOTE_ROOT", "/").strip("/")

    if not host or not user or not password or "HIER_LOKAL_EINTRAGEN" in password:
        raise SystemExit("FTPS Host, Benutzer oder Passwort fehlen in inside/deploy/ftps.env")

    files = deployment_files()
    print(f"Deploy Frisia Inside: {len(files)} Dateien")

    ftps = FTP_TLS(timeout=45)
    ftps.connect(host, 21)
    ftps.auth()
    ftps.login(user, password)
    ftps.prot_p()
    ftps.set_pasv(True)

    try:
        for index, (file_path, relative) in enumerate(files, start=1):
            remote_path = "/".join(part for part in [remote_root, relative] if part)
            for attempt in range(1, 4):
                try:
                    upload_file(ftps, file_path, remote_path)
                    break
                except (OSError, socket.timeout, error_perm) as exc:
                    if attempt == 3:
                        raise RuntimeError(f"Upload fehlgeschlagen: {relative}: {exc}") from exc
                    try:
                        ftps.close()
                    except Exception:
                        pass
                    ftps = FTP_TLS(timeout=45)
                    ftps.connect(host, 21)
                    ftps.auth()
                    ftps.login(user, password)
                    ftps.prot_p()
                    ftps.set_pasv(True)
            print(f"[{index}/{len(files)}] {relative}")
    finally:
        try:
            ftps.quit()
        except Exception:
            ftps.close()

    print("Deploy abgeschlossen.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
