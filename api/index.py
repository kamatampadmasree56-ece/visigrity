import sys
import os

# Root entrypoint for Vercel deployment when Root Directory is set to repository root (.)
# Resolves the 'backend' folder relative to this api/index.py file
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.abspath(os.path.join(project_root, "backend"))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Expose app for Vercel ASGI serverless handler
handler = app
