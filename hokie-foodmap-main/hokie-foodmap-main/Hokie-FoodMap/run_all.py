import subprocess
import os


backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend-files")

scripts = [
    "account.py",
    "events_server.py",
    "scraper.py",
    "favorite_server.py"
]

processes = []
for script in scripts:
    script_path = os.path.join(backend_dir, script)
    print(f"Starting {script}...")
    p = subprocess.Popen(["python", script_path], cwd=backend_dir)
    processes.append(p)

print("All scripts launched")