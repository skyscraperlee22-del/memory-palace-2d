#!/usr/bin/env python3
"""Verify the published 2D runtime against the frozen source asset manifest."""
import hashlib, json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
assets = root / "app/src/main/assets/memory-palace"
manifest = json.loads((root / "docs/runtime-sha256.json").read_text())
for name, expected in manifest.items():
    assert hashlib.sha256((assets / name).read_bytes()).hexdigest() == expected, name
print(f"Verified {len(manifest)} runtime files")
