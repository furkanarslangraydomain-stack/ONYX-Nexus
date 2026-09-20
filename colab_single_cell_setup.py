#!/usr/bin/env python3
"""ONYX-Nexus single-cell Google Colab SSH bootstrapper.

Run this file once from a Google Colab cell. It installs tmate/OpenSSH,
starts the existing ONYX FastAPI application on port 8000, and prints the
SSH and browser terminal links.
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

SOCKET = "/tmp/onyx-tmate.sock"
PORT = int(os.getenv("ONYX_PORT", "8000"))
ROOT = Path(os.getenv("ONYX_ROOT", "/content/ONYX-Nexus"))
LOG_DIR = ROOT / "logs"
DAEMON_LOG = LOG_DIR / "onyx-colab.log"


def run(command: list[str], *, check: bool = True, quiet: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        check=check,
        text=True,
        stdout=subprocess.DEVNULL if quiet else None,
        stderr=subprocess.STDOUT if quiet else None,
    )


def install_system_packages() -> None:
    print("[1/5] OpenSSH, tmate ve curl kuruluyor...")
    run(["apt-get", "update", "-qq"], quiet=True)
    run(["apt-get", "install", "-y", "-qq", "openssh-client", "openssh-server", "tmate", "curl"], quiet=True)


def install_python_packages() -> None:
    print("[2/5] Python bağımlılıkları doğrulanıyor...")
    requirements = ROOT / "requirements.txt"
    if requirements.exists():
        run([sys.executable, "-m", "pip", "install", "-q", "-r", str(requirements)], check=False)
    else:
        run([sys.executable, "-m", "pip", "install", "-q", "fastapi", "uvicorn", "httpx", "pydantic", "python-dotenv"], check=False)


def start_daemon() -> subprocess.Popen[str]:
    print(f"[3/5] ONYX-Nexus FastAPI daemon başlatılıyor (127.0.0.1:{PORT})...")
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log = DAEMON_LOG.open("a", encoding="utf-8")
    env = os.environ.copy()
    env.update({"HOST": "127.0.0.1", "PORT": str(PORT), "EXECUTION_ENGINE": "colab"})
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(PORT), "--workers", "1"],
        cwd=ROOT,
        env=env,
        stdout=log,
        stderr=subprocess.STDOUT,
        text=True,
        start_new_session=True,
    )
    time.sleep(3)
    if process.poll() is not None:
        raise RuntimeError(f"ONYX daemon başlatılamadı. Log: {DAEMON_LOG}")
    return process


def start_tmate() -> tuple[str, str]:
    print("[4/5] tmate SSH tüneli başlatılıyor...")
    if Path(SOCKET).exists():
        run(["tmate", "-S", SOCKET, "kill-session"], check=False, quiet=True)
        Path(SOCKET).unlink(missing_ok=True)
    run(["tmate", "-S", SOCKET, "new-session", "-d"], quiet=True)
    run(["tmate", "-S", SOCKET, "wait", "tmate-ready"], quiet=True)
    ssh = subprocess.check_output(["tmate", "-S", SOCKET, "display", "-p", "#{tmate_ssh}"], text=True).strip()
    web = subprocess.check_output(["tmate", "-S", SOCKET, "display", "-p", "#{tmate_web}"], text=True).strip()
    return ssh, web


def main() -> None:
    if not ROOT.exists():
        raise SystemExit(f"Repo bulunamadı: {ROOT}. Önce /content/ONYX-Nexus içine klonlayın.")
    install_system_packages()
    install_python_packages()
    start_daemon()
    ssh, web = start_tmate()
    print("[5/5] Kurulum tamamlandı.")
    print("\n" + "=" * 78)
    print("ONYX-Nexus tek hücre Colab SSH sunucusu hazır")
    print("=" * 78)
    print(f"SSH:          {ssh}")
    print(f"Web terminal: {web}")
    print(f"API:          http://127.0.0.1:{PORT}")
    print(f"Health:       http://127.0.0.1:{PORT}/health")
    print(f"Log:          {DAEMON_LOG}")
    print("\nNot: Colab oturumu kapanırsa daemon ve tmate bağlantısı da kapanır.")


if __name__ == "__main__":
    main()
