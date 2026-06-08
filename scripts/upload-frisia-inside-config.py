#!/usr/bin/env python3
from __future__ import annotations

import os
from ftplib import FTP_TLS, error_perm
from pathlib import Path


REPO_ROOT = Path.cwd()
DEPLOY_ENV_PATH = REPO_ROOT / "inside" / "deploy" / "ftps.env"
CONFIG_PATH = REPO_ROOT / "inside" / "deploy" / "server-config.php"


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


def ensure_directory(ftps: FTP_TLS, remote_dir: str) -> None:
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


def main() -> int:
    if not DEPLOY_ENV_PATH.exists():
        raise SystemExit(f"FTPS-Konfiguration fehlt: {DEPLOY_ENV_PATH}")
    if not CONFIG_PATH.exists():
        raise SystemExit(f"Server-Konfiguration fehlt: {CONFIG_PATH}")

    env = read_env(DEPLOY_ENV_PATH)
    host = host_from_value(env.get("FRISIA_INSIDE_FTPS_HOST", ""))
    user = env.get("FRISIA_INSIDE_FTPS_USER", "")
    password = env.get("FRISIA_INSIDE_FTPS_PASSWORD", "")
    remote_root = env.get("FRISIA_INSIDE_REMOTE_ROOT", "/").strip("/")
    remote_path = "/".join(part for part in [remote_root, "private/config.php"] if part)

    if not host or not user or not password or "HIER_LOKAL_EINTRAGEN" in password:
        raise SystemExit("FTPS Host, Benutzer oder Passwort fehlen.")

    ftps = FTP_TLS(timeout=45)
    ftps.connect(host, 21)
    ftps.auth()
    ftps.login(user, password)
    ftps.prot_p()
    ftps.set_pasv(True)
    try:
        ensure_directory(ftps, os.path.dirname(remote_path))
        current = ftps.pwd()
        try:
            ftps.cwd(os.path.dirname(remote_path))
            with CONFIG_PATH.open("rb") as handle:
                ftps.storbinary(f"STOR {os.path.basename(remote_path)}", handle)
        finally:
            ftps.cwd(current)
    finally:
        ftps.quit()

    print("Server-Konfiguration hochgeladen: private/config.php")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
