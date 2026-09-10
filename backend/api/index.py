import sys
import os

# Add parent directory to sys.path so app modules can be resolved
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.main import app
