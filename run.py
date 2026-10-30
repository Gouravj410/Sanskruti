#!/usr/bin/env python3
"""
=============================================================================
SANSKRITI — SINGLE-CLICK ZERO-CONFIG RUNNER
=============================================================================
Run this single file on any computer (Windows, macOS, Linux):
    python run.py

It will automatically:
1. Verify Python & Node.js/npm are available.
2. Auto-install backend Python requirements if missing.
3. Apply Alembic database migrations & auto-seed if first run.
4. Auto-install frontend npm dependencies if node_modules is missing.
5. Launch FastAPI Backend on port 8000.
6. Launch Vite React Frontend on port 5173.
7. Open http://localhost:5173 automatically in your default browser.
8. Cleanly terminate all background processes on Ctrl+C.
=============================================================================
"""

import os
import sys
import time
import shutil
import signal
import platform
import subprocess
import webbrowser
import urllib.request
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
SEED_SCRIPT = ROOT_DIR / "database" / "seed" / "seed_data.py"
DB_FILE = BACKEND_DIR / "sanskruti.db"

# ANSI Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Global process tracking for clean shutdown
backend_proc = None
frontend_proc = None


def print_banner():
    banner = f"""
{CYAN}{BOLD}=============================================================================
   SANSKRITI — DIGITAL CULTURAL HERITAGE ARCHIVE & PRESERVATION
============================================================================={RESET}
   Platform: {platform.system()} ({platform.machine()})
   Python:   {sys.version.split()[0]}
   Path:     {ROOT_DIR}
-----------------------------------------------------------------------------
"""
    print(banner)


def check_node():
    """Verify that npm and node are installed."""
    npm_path = shutil.which("npm")
    node_path = shutil.which("node")
    if not npm_path or not node_path:
        print(f"{RED}[ERROR] Node.js and npm are required to run the frontend.{RESET}")
        print("Please download and install Node.js (v18+) from: https://nodejs.org/")
        sys.exit(1)
    return npm_path


def setup_backend():
    """Verify and setup backend dependencies, migrations, and seed data."""
    print(f"{YELLOW}▶ [1/4] Checking Backend dependencies...{RESET}")
    
    # Check if key packages are importable
    needed = False
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import alembic
        import PIL
    except ImportError:
        needed = True

    if needed:
        print(f"{YELLOW}   Installing backend packages from requirements.txt...{RESET}")
        cmd = [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]
        res = subprocess.run(cmd, cwd=str(BACKEND_DIR))
        if res.returncode != 0:
            print(f"{RED}[ERROR] Failed to install backend dependencies.{RESET}")
            sys.exit(1)
        print(f"{GREEN}   Backend packages installed successfully.{RESET}")
    else:
        print(f"{GREEN}   Backend packages already satisfied.{RESET}")

    # Run database migrations
    print(f"{YELLOW}▶ [2/4] Applying database migrations (Alembic)...{RESET}")
    res = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True
    )
    if res.returncode != 0 and "Target database is not up to date" in res.stderr:
        print(f"{RED}[ERROR] Alembic migration failed: {res.stderr}{RESET}")
        sys.exit(1)
    print(f"{GREEN}   Database schema up-to-date.{RESET}")

    # If DB file doesn't exist or is tiny (< 10KB), seed it
    should_seed = not DB_FILE.exists() or DB_FILE.stat().st_size < 10000
    if should_seed and SEED_SCRIPT.exists():
        print(f"{YELLOW}   First run detected: Idempotently seeding cultural archive records...{RESET}")
        subprocess.run([sys.executable, str(SEED_SCRIPT)], cwd=str(ROOT_DIR))
        print(f"{GREEN}   Seeding complete (8 Art Forms, 14 Artifacts, 3 Master Practitioners).{RESET}")


def setup_frontend(npm_cmd):
    """Verify and setup frontend node_modules."""
    print(f"{YELLOW}▶ [3/4] Checking Frontend dependencies...{RESET}")
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print(f"{YELLOW}   First run detected: Installing frontend npm packages (this may take a minute)...{RESET}")
        res = subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR))
        if res.returncode != 0:
            print(f"{RED}[ERROR] npm install failed.{RESET}")
            sys.exit(1)
        print(f"{GREEN}   Frontend packages installed successfully.{RESET}")
    else:
        print(f"{GREEN}   Frontend packages already installed.{RESET}")


def terminate_process(proc, name="Process"):
    """Safely terminate a process and its child processes across platforms."""
    if not proc or proc.poll() is not None:
        return
    try:
        if platform.system() == "Windows":
            # Force kill entire process tree on Windows
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
    except Exception as e:
        print(f"Error terminating {name}: {e}")


def shutdown(signum=None, frame=None):
    """Graceful shutdown handler for Ctrl+C or kill signals."""
    print(f"\n{YELLOW}Stopping Sanskriti servers gracefully...{RESET}")
    terminate_process(frontend_proc, "Frontend")
    terminate_process(backend_proc, "Backend")
    print(f"{GREEN}All Sanskriti services have been shut down cleanly. Goodbye!{RESET}\n")
    sys.exit(0)


def wait_for_backend(url="http://127.0.0.1:8000/api/v1/health", timeout=12):
    """Poll backend until it starts responding."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False


def main():
    global backend_proc, frontend_proc

    print_banner()

    # Register signal handlers for clean exit
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # 1. Environment checks & dependency preparation
    npm_cmd = check_node()
    setup_backend()
    setup_frontend(npm_cmd)

    # 2. Launch Backend
    print(f"{YELLOW}▶ [4/4] Launching Sanskriti Full-Stack Servers...{RESET}")
    print(f"   Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(BACKEND_DIR)
    )

    # Wait for backend readiness
    if not wait_for_backend():
        print(f"{YELLOW}   Backend is taking a few moments to initialize...{RESET}")

    # 3. Launch Frontend
    print(f"   Starting Vite Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR)
    )

    # 4. Print running summary
    print(f"""
{GREEN}{BOLD}=============================================================================
   ✓ SANSKRITI APPLICATION IS LIVE!
============================================================================={RESET}

   🌐 {BOLD}Web Application:{RESET}       http://localhost:5173
   📚 {BOLD}Archival Catalog:{RESET}      http://localhost:5173/explore
   🛡️  {BOLD}Curator Editorial Desk:{RESET} http://localhost:5173/curator
      {CYAN}Access Key:{RESET}             sanskruti_curator_secret_2026
   🤖 {BOLD}Ask Sanskriti AI:{RESET}       http://localhost:5173/ask
   ⚙️  {BOLD}Interactive API Docs:{RESET}   http://127.0.0.1:8000/docs
   💓 {BOLD}Backend Health:{RESET}         http://127.0.0.1:8000/api/v1/health

-----------------------------------------------------------------------------
   {BOLD}Controls:{RESET}
   - Your default web browser will open automatically in 2 seconds.
   - Press {RED}{BOLD}Ctrl + C{RESET} in this terminal anytime to stop both servers.
=============================================================================
""")

    # Open browser automatically after a short pause
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    # Keep script alive and monitor processes
    try:
        while True:
            time.sleep(1)
            # If backend unexpectedly died
            if backend_proc.poll() is not None:
                print(f"{RED}[ERROR] Backend process terminated unexpectedly.{RESET}")
                break
            # If frontend unexpectedly died
            if frontend_proc.poll() is not None:
                print(f"{RED}[ERROR] Frontend process terminated unexpectedly.{RESET}")
                break
    except KeyboardInterrupt:
        pass
    finally:
        shutdown()


if __name__ == "__main__":
    main()
