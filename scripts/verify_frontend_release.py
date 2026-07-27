#!/usr/bin/env python3
"""Verify the pinned static frontend release without starting the app."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DATA = ROOT / "frontend/public/data"
EXPECTED_RELEASE = "ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1"
EXPECTED_PROJECTION = "PROJ_DG761_20260723_213011_KST_4665FDF3E5CF"
EXPECTED_PROJECTION_HASH = "4665fdf3e5cf8e5fc69d214d5e0a744e8a8d489b87fb4766b320f6f28887784f"
EXPECTED_MANIFEST_HASH = "2443ed983098ab2b82afb15ccc1304412cf3772f8180ff6c01a2d2a5ee4f4b3a"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    pointer = load_json(PUBLIC_DATA / "current-release.json")
    require(pointer["release_id"] == EXPECTED_RELEASE, "current release differs")
    require(pointer["projection_id"] == EXPECTED_PROJECTION, "projection ID differs")
    require(pointer["projection_hash"] == EXPECTED_PROJECTION_HASH, "projection hash differs")

    releases = [path for path in (PUBLIC_DATA / "releases").iterdir() if path.is_dir()]
    require([path.name for path in releases] == [EXPECTED_RELEASE], "more than one runtime release found")
    release_dir = releases[0]
    manifest_path = release_dir / "frontend-manifest.json"
    manifest_hash = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    require(manifest_hash == EXPECTED_MANIFEST_HASH, "frontend manifest hash differs")
    require(pointer["manifest_sha256"] == manifest_hash, "pointer manifest hash differs")

    manifest = load_json(manifest_path)
    require(manifest["release_id"] == EXPECTED_RELEASE, "manifest release differs")
    require(manifest["projection_id"] == EXPECTED_PROJECTION, "manifest projection differs")
    records = manifest["files"]
    require(len(records) == 80, "manifest declared file count differs")
    missing, mismatched = [], []
    for record in records:
        path = release_dir / record["path"]
        if not path.is_file():
            missing.append(record["path"])
            continue
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual_hash != record["sha256"] or path.stat().st_size != record["size_bytes"]:
            mismatched.append(record["path"])
    require(not missing, f"missing release files: {missing[:3]}")
    require(not mismatched, f"release file mismatch: {mismatched[:3]}")

    summary = load_json(release_dir / "atlas-summary.json")
    story = load_json(release_dir / "story-metrics.json")
    nodes = load_json(release_dir / "atlas-nodes-all.json")
    evidence = load_json(release_dir / "evidence-index.json")
    topics = load_json(release_dir / "topic-bins-index.json")
    members = load_json(release_dir / "node-members.json")
    require(len(summary["story_preview_node_ids"]) == 16, "Story Preview node count differs")
    require(story["story_preview_node_count"] == 16, "Story metrics preview count differs")
    require(len(nodes) == 140, "Full Atlas node count differs")
    require(len(evidence) == 64, "evidence count differs")
    require(len(topics) == 24, "topic bin count differs")
    require(len(members) == 761, "node member count differs")
    require(len(list((release_dir / "evidence").glob("*.json"))) == 64, "evidence detail file count differs")

    result = {
        "status": "PASS",
        "release_id": EXPECTED_RELEASE,
        "projection_id": EXPECTED_PROJECTION,
        "manifest_sha256": manifest_hash,
        "manifest_declared_files": len(records),
        "missing": 0,
        "hash_mismatch": 0,
        "story_preview_nodes": 16,
        "explorer_nodes": len(nodes),
        "evidence_records": len(evidence),
        "topic_bins": len(topics),
        "node_members": len(members),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
