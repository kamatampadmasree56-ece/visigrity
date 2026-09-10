import sys
import os

# Robust path resolution for Vercel Python Serverless runtime
# Determines current directory and backend root directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Also ensure current working directory is on sys.path
cwd = os.getcwd()
if cwd not in sys.path:
    sys.path.insert(0, cwd)

backend_cwd = os.path.join(cwd, "backend")
if os.path.exists(backend_cwd) and backend_cwd not in sys.path:
    sys.path.insert(0, backend_cwd)

from app.main import app

# Expose app for Vercel ASGI serverless handler
handler = app
