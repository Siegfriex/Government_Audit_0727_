#!/usr/bin/env python3
"""Build the sanitized public reproduction asset outside Git history."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_NAME = "P3_CULTURE_PORTFOLIO_REPRODUCTION_v1.0.0"
RELEASE_ID = "ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1"
PROJECTION_ID = "PROJ_DG761_20260723_213011_KST_4665FDF3E5CF"
MODEL_WEIGHT_SHA256 = "eaa086f0ffee582aeb45b36e34cdd1fe2d6de2bef61f8a559a1bbc9bd955917b"
TEXT_SUFFIXES = {".csv", ".json", ".md", ".txt", ".ipynb", ".py", ".yml", ".yaml", ".cff"}
FORBIDDEN_TEXT = [
    re.compile(r"/home/"),
    re.compile(r"/Users/"),
    re.compile(r"[A-Za-z]:\\\\"),
    re.compile(r"ghp_[A-Za-z0-9]+"),
    re.compile(r"github_pat_[A-Za-z0-9_]+"),
    re.compile(r"VERCEL_TOKEN\s*="),
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def copy_item(source: Path, destination: Path) -> None:
    if source.is_dir():
        shutil.copytree(source, destination, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".cache", "*.lock"))
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def role_for(relative: str) -> str:
    if relative.startswith("data/raw/meeting_pdfs/"):
        return "official audit minutes PDF"
    if relative.startswith("models/paraphrase-"):
        return "pinned MiniLM snapshot"
    if relative.startswith("data/reviewed/"):
        return "sanitized reviewed data"
    if relative.startswith("data/source_registry/") or relative.startswith("data/metadata/"):
        return "source metadata and provenance"
    if relative.startswith("data/pipeline/"):
        return "small reproducible pipeline output"
    if relative.endswith(".ipynb"):
        return "single reproduction notebook"
    return "documentation or validation"


def scan_text_files(package_root: Path) -> None:
    for path in package_root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        matches = [pattern.pattern for pattern in FORBIDDEN_TEXT if pattern.search(text)]
        if matches:
            raise ValueError(f"forbidden local or credential pattern in {path.relative_to(package_root)}: {matches}")


def validate_sources(package_root: Path) -> None:
    pdf_dir = package_root / "data/raw/meeting_pdfs"
    pdfs = sorted(pdf_dir.glob("*.pdf"))
    if len(pdfs) != 42:
        raise ValueError(f"expected 42 meeting PDFs, found {len(pdfs)}")
    cards_path = package_root / "data/metadata/DATA_SOURCE_CARDS.csv"
    with cards_path.open(encoding="utf-8-sig", newline="") as stream:
        cards = list(csv.DictReader(stream))
    minutes = {row["file_name"]: row for row in cards if row["source_family"] == "AUDIT_MINUTES"}
    if len(minutes) != 42:
        raise ValueError("expected 42 AUDIT_MINUTES source cards")
    for path in pdfs:
        card = minutes.get(path.name)
        if card is None or sha256(path) != card["sha256"]:
            raise ValueError(f"meeting PDF hash mismatch: {path.name}")
    if list((package_root / "data/raw").glob("target_reports/*.pdf")):
        raise ValueError("target report PDF must not be included")
    weight = package_root / "models/paraphrase-multilingual-MiniLM-L12-v2/model.safetensors"
    if not weight.is_file() or sha256(weight) != MODEL_WEIGHT_SHA256:
        raise ValueError("MiniLM model weight missing or hash mismatch")


def build(submission_root: Path, output_dir: Path) -> tuple[Path, Path]:
    if not submission_root.is_dir():
        raise FileNotFoundError(submission_root)
    output_dir.mkdir(parents=True, exist_ok=True)
    archive_path = output_dir / f"{PACKAGE_NAME}.zip"
    hash_path = output_dir / f"{PACKAGE_NAME}.zip.sha256"

    with tempfile.TemporaryDirectory(prefix="p3_public_release_") as temporary:
        package_root = Path(temporary) / PACKAGE_NAME
        package_root.mkdir()
        repo_items = [
            "README.md", "DATA_NOTICE.md", "LICENSE", "P3_CULTURE_DATA_PIPELINE.ipynb", "requirements-data.txt",
            "data/metadata", "data/source_registry", "data/reviewed", "data/pipeline",
            "reports/reproducibility", "models/README.md",
        ]
        for relative in repo_items:
            source = ROOT / relative
            if not source.exists():
                raise FileNotFoundError(source)
            copy_item(source, package_root / relative)

        copy_item(submission_root / "data/raw/meeting_pdfs", package_root / "data/raw/meeting_pdfs")
        copy_item(
            submission_root / "models/paraphrase-multilingual-MiniLM-L12-v2",
            package_root / "models/paraphrase-multilingual-MiniLM-L12-v2",
        )
        validate_sources(package_root)
        scan_text_files(package_root)

        files = []
        for path in sorted(item for item in package_root.rglob("*") if item.is_file()):
            relative = path.relative_to(package_root).as_posix()
            files.append({
                "relative_path": relative,
                "size_bytes": path.stat().st_size,
                "sha256": sha256(path),
                "role": role_for(relative),
            })
        manifest = {
            "package_name": PACKAGE_NAME,
            "canonical_release_id": RELEASE_ID,
            "projection_id": PROJECTION_ID,
            "source_pdf_count": 42,
            "target_report_pdf_count": 0,
            "reviewed_data_sanitized": True,
            "model_weight_sha256": MODEL_WEIGHT_SHA256,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "files": files,
        }
        (package_root / "PUBLIC_PACKAGE_MANIFEST.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

        with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for path in sorted(item for item in package_root.rglob("*") if item.is_file()):
                archive.write(path, f"{PACKAGE_NAME}/{path.relative_to(package_root).as_posix()}")

    digest = sha256(archive_path)
    hash_path.write_text(f"{digest}  {archive_path.name}\n", encoding="utf-8")
    print(json.dumps({
        "status": "PASS",
        "archive": str(archive_path),
        "size_bytes": archive_path.stat().st_size,
        "sha256": digest,
        "meeting_pdfs": 42,
        "target_report_pdfs": 0,
        "minilm_weight": "included",
    }, ensure_ascii=False, indent=2))
    return archive_path, hash_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--submission-root", required=True, type=Path)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "release-assets")
    args = parser.parse_args()
    build(args.submission_root.resolve(), args.output_dir.resolve())


if __name__ == "__main__":
    main()

