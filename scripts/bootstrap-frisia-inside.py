#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import urllib.error
import urllib.request
from pathlib import Path


REPO_ROOT = Path.cwd()
BOOTSTRAP_ENV = REPO_ROOT / "inside" / "deploy" / "bootstrap.env"
SERVER_CONFIG = REPO_ROOT / "inside" / "deploy" / "server-config.php"
BASE_URL = "https://frisia-inside.de"


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


def extract_config_value(content: str, key: str) -> str:
    match = re.search(rf"'{re.escape(key)}'\s*=>\s*'([^']*)'", content)
    return match.group(1) if match else ""


def php_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def write_server_config(env: dict[str, str]) -> str:
    if not SERVER_CONFIG.exists():
        raise SystemExit(f"Server-Konfiguration fehlt: {SERVER_CONFIG}")

    existing = SERVER_CONFIG.read_text()
    setup_token = extract_config_value(existing, "setup_token")
    cron_token = extract_config_value(existing, "cron_token")
    if not setup_token or not cron_token:
        raise SystemExit("Setup-/Cron-Token fehlen in server-config.php")

    required = [
        "FRISIA_INSIDE_DB_HOST",
        "FRISIA_INSIDE_DB_NAME",
        "FRISIA_INSIDE_DB_USER",
        "FRISIA_INSIDE_DB_PASSWORD",
        "FRISIA_INSIDE_ADMIN_EMAIL",
        "FRISIA_INSIDE_ADMIN_NAME",
        "FRISIA_INSIDE_ADMIN_PASSWORD",
    ]
    missing = [key for key in required if not env.get(key) or "HIER_LOKAL_EINTRAGEN" in env.get(key, "")]
    if missing:
        raise SystemExit("Bootstrap-Daten fehlen oder sind Platzhalter: " + ", ".join(missing))

    db_port = env.get("FRISIA_INSIDE_DB_PORT", "").strip()
    port_segment = f";port={db_port}" if db_port else ""
    dsn = (
        f"mysql:host={env['FRISIA_INSIDE_DB_HOST']};"
        f"dbname={env['FRISIA_INSIDE_DB_NAME']}{port_segment};charset=utf8mb4"
    )
    openai_key = env.get("FRISIA_INSIDE_OPENAI_API_KEY", "").strip()
    openai_model = env.get("FRISIA_INSIDE_OPENAI_MODEL", "gpt-5.4-mini").strip() or "gpt-5.4-mini"
    web_env_path = REPO_ROOT / "web" / ".env.local"
    web_env = read_env(web_env_path) if web_env_path.exists() else {}
    propstack_key = (
        env.get("FRISIA_INSIDE_PROPSTACK_API_KEY", "").strip()
        or web_env.get("PROPSTACK_API_KEY", "").strip()
    )
    gsc_property = env.get("FRISIA_INSIDE_GSC_PROPERTY", "https://frisia-immobilien.de/").strip()
    website_snapshot_token = env.get("FRISIA_INSIDE_WEBSITE_SNAPSHOT_TOKEN", "").strip()
    content = f"""<?php

return [
    'app' => [
        'name' => 'Frisia Inside',
        'session_name' => 'FRISIA_INSIDE',
        'base_url' => '{BASE_URL}',
        'setup_token' => '{php_string(setup_token)}',
        'cron_token' => '{php_string(cron_token)}',
        'website_snapshot_token' => '{php_string(website_snapshot_token)}',
    ],
    'db' => [
        'dsn' => '{php_string(dsn)}',
        'user' => '{php_string(env['FRISIA_INSIDE_DB_USER'])}',
        'password' => '{php_string(env['FRISIA_INSIDE_DB_PASSWORD'])}',
    ],
    'openai' => [
        'api_key' => '{php_string(openai_key)}',
        'model' => '{php_string(openai_model)}',
    ],
    'integrations' => [
        'propstack_api_key' => '{php_string(propstack_key)}',
        'google_search_console_property' => '{php_string(gsc_property)}',
    ],
];
"""
    SERVER_CONFIG.write_text(content)
    SERVER_CONFIG.chmod(0o600)
    return setup_token


def post_json(url: str, payload: dict, headers: dict[str, str] | None = None, allow_http_error: bool = False) -> dict:
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        if allow_http_error:
            try:
                return json.loads(body)
            except json.JSONDecodeError:
                return {"ok": False, "error": body, "status": exc.code}
        raise SystemExit(f"HTTP {exc.code} bei {url}: {body}") from exc


def main() -> int:
    if not BOOTSTRAP_ENV.exists():
        raise SystemExit(f"Bootstrap-Konfiguration fehlt: {BOOTSTRAP_ENV}")

    env = read_env(BOOTSTRAP_ENV)
    setup_token = write_server_config(env)

    subprocess.run(["npm", "run", "upload-config:inside"], cwd=REPO_ROOT, check=True)

    install = post_json(
        f"{BASE_URL}/api/setup/install-schema.php",
        {"seed": True},
        {"X-Setup-Token": setup_token},
    )
    if not install.get("ok"):
        raise SystemExit("Schema-Installation fehlgeschlagen: " + json.dumps(install, ensure_ascii=False))

    admin = post_json(
        f"{BASE_URL}/api/setup/create-admin.php",
        {
            "setup_token": setup_token,
            "email": env["FRISIA_INSIDE_ADMIN_EMAIL"],
            "name": env["FRISIA_INSIDE_ADMIN_NAME"],
            "password": env["FRISIA_INSIDE_ADMIN_PASSWORD"],
        },
        allow_http_error=True,
    )
    if not admin.get("ok"):
        admin_error = str(admin.get("error", ""))
        if "bereits" not in admin_error.lower():
            raise SystemExit("Admin-Anlage fehlgeschlagen: " + json.dumps(admin, ensure_ascii=False))

    print("Frisia Inside Bootstrap abgeschlossen.")
    print("Schema installiert und Admin geprueft.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
