from pathlib import Path
import os

# Change this to your root directory
ROOT_DIR = r"D:\\Temp\workspaces\\github\\klmyayinlari\\database\\books"

for root, dirs, files in os.walk(ROOT_DIR):
    jpg_files = [f for f in files if f.lower().endswith(".jpg")]
    print(jpg_files)
    if not jpg_files:
        continue

    # Rename the first JPG file to cover.jpg
    source = Path(root) / jpg_files[0]
    destination = Path(root) / "cover.jpg"

    if destination.exists():
        print(f"Skipped (cover.jpg already exists): {root}")
        continue

    source.rename(destination)
    print(f"Renamed: {source.name} -> cover.jpg")