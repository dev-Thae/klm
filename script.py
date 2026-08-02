from pathlib import Path
import os

# Change this to your root directory
ROOT_DIR = r"D:\\Temp\workspaces\\github\\klmyayinlari\\database\\books"

for root, dirs, files in os.walk(ROOT_DIR):
    image_files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    print(image_files)
    if not image_files:
        continue

    # Rename the first image file to cover.<ext>
    source = Path(root) / image_files[0]
    destination = Path(root) / f"cover{source.suffix.lower()}"

    if destination.exists():
        print(f"Skipped (cover.jpg already exists): {root}")
        continue

    source.rename(destination)
    print(f"Renamed: {source.name} -> cover.jpg")