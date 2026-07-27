#!/usr/bin/env python3
"""Public portfolio data checks that avoid model fitting and network access."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
EXPECTED = json.loads((ROOT / "data/metadata/EXPECTED_COUNTS.json").read_text(encoding="utf-8"))
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
PRIVATE_COLUMN_RE = re.compile(r"reviewer|email|local.*path|internal.*note|policy.*memo", re.I)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def count_rows(path: Path) -> int:
    if path.suffix == ".parquet":
        return len(pd.read_parquet(path))
    return len(pd.read_csv(path))


def validate_sources() -> dict[str, object]:
    cards = pd.read_csv(ROOT / "data/metadata/DATA_SOURCE_CARDS.csv")
    required = {
        "source_id", "source_family", "title", "organization", "year",
        "file_name", "file_type", "page_count", "sha256", "role_in_pipeline",
    }
    require(required == set(cards.columns), "DATA_SOURCE_CARDS columns differ")
    require(len(cards) == 45, "source card count must be 45")
    counts = cards.groupby("source_family").size().to_dict()
    require(counts == {"AUDIT_MINUTES": 42, "TARGET_REPORT": 3}, "source family counts differ")
    require(cards["sha256"].map(lambda value: bool(SHA256_RE.fullmatch(str(value)))).all(), "invalid source hash")

    registry = pd.read_csv(ROOT / "data/source_registry/meeting_sources_public.csv")
    require(len(registry) == EXPECTED["meeting_pdfs"], "meeting registry count differs")
    require(int(registry["page_count"].sum()) == EXPECTED["meeting_pages"], "meeting page sum differs")
    require(registry["meeting_id"].is_unique, "duplicate meeting_id")
    require(registry["sha256"].is_unique, "duplicate meeting hash")
    require(registry["source_url"].notna().all(), "missing official source URL")
    require(not registry.astype(str).apply(lambda col: col.str.contains("/home/").any()).any(), "absolute local path found")
    return {"source_cards": len(cards), "meeting_pdfs": len(registry), "meeting_pages": int(registry.page_count.sum())}


def validate_preparation() -> dict[str, object]:
    files = {
        "qa_pairs": ROOT / "data/pipeline/qa_pairs.parquet",
        "answer_units": ROOT / "data/pipeline/answer_units.parquet",
    }
    result = {}
    for key, path in files.items():
        require(path.exists(), f"missing {path.relative_to(ROOT)}")
        result[key] = count_rows(path)
        require(result[key] == EXPECTED[key], f"{key} count differs")
    return result


def validate_retrieval() -> dict[str, object]:
    paths = {
        "reviewed_links": ROOT / "data/reviewed/reviewed_links.parquet",
        "answer_behavior_labels": ROOT / "data/reviewed/answer_behavior_labels.parquet",
        "decision_groups": ROOT / "data/reviewed/decision_groups.parquet",
    }
    frames = {name: pd.read_parquet(path) for name, path in paths.items()}
    for name, frame in frames.items():
        private = [column for column in frame.columns if PRIVATE_COLUMN_RE.search(column)]
        require(not private, f"private columns in {name}: {private}")
        require(not frame.astype(str).apply(lambda col: col.str.contains("/home/|[A-Za-z]:\\\\", regex=True).any()).any(), f"local path in {name}")
    require(len(frames["answer_behavior_labels"]) == EXPECTED["answer_behavior_labels"], "behavior label count differs")
    require(len(frames["decision_groups"]) == EXPECTED["decision_groups"], "decision group count differs")
    queries = pd.read_parquet(ROOT / "data/pipeline/target_issues.parquet")
    candidates = pd.read_parquet(ROOT / "data/pipeline/retrieval_candidates.parquet")
    require(len(queries) == EXPECTED["search_queries"], "search query count differs")
    require(len(candidates) == EXPECTED["search_candidates"], "search candidate count differs")
    result = {name: len(frame) for name, frame in frames.items()}
    result.update({"search_queries": len(queries), "search_candidates": len(candidates)})
    return result


def validate_atlas() -> dict[str, object]:
    points = pd.read_csv(ROOT / "data/pipeline/projection_points.csv")
    topics = pd.read_csv(ROOT / "data/pipeline/topic_bins.csv")
    nodes = pd.read_csv(ROOT / "data/pipeline/atlas_nodes.csv")
    members = pd.read_parquet(ROOT / "data/pipeline/atlas_node_members.parquet")
    require(len(points) == EXPECTED["projection_points"], "projection point count differs")
    require(len(topics) == EXPECTED["topic_bins"], "topic bin count differs")
    require(len(nodes) == EXPECTED["atlas_nodes"], "atlas node count differs")
    point_id = "projection_entity_id" if "projection_entity_id" in points else "decision_group_id"
    require(points[point_id].is_unique, "duplicate projection ID")
    coordinate_columns = [column for column in points if column.lower() in {"x", "y", "umap_x", "umap_y"}]
    require(len(coordinate_columns) >= 2, "projection coordinate columns missing")
    require(points[coordinate_columns].map(lambda value: math.isfinite(float(value))).all().all(), "non-finite coordinate")
    member_id = next((column for column in ["projection_entity_id", "decision_group_id", "atlas_node_member_id"] if column in members), None)
    require(member_id is not None and members[member_id].is_unique, "duplicate or missing node member ID")
    require(len(members) == EXPECTED["decision_groups"], "node membership coverage differs")
    return {"projection_points": len(points), "topic_bins": len(topics), "atlas_nodes": len(nodes), "atlas_members": len(members)}


def validate_frontend() -> dict[str, object]:
    pointer_path = ROOT / "frontend/public/data/current-release.json"
    pointer = json.loads(pointer_path.read_text(encoding="utf-8"))
    release_id = pointer["release_id"]
    release_dir = ROOT / "frontend/public/data/releases" / release_id
    manifest_path = release_dir / "frontend-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    files = manifest.get("files", [])
    mismatches = []
    for record in files:
        relative = record.get("relative_path") or record.get("path")
        expected_hash = record.get("sha256")
        path = release_dir / relative
        actual = hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None
        if actual != expected_hash:
            mismatches.append(relative)
    require(not mismatches, f"frontend release hash mismatch: {mismatches[:3]}")
    return {"release_id": release_id, "manifest_files": len(files), "hash_mismatches": 0}


CHECKS = {
    "sources": validate_sources,
    "preparation": validate_preparation,
    "retrieval": validate_retrieval,
    "atlas": validate_atlas,
    "frontend": validate_frontend,
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage", choices=[*CHECKS, "all"], default="all")
    args = parser.parse_args()
    selected = CHECKS if args.stage == "all" else {args.stage: CHECKS[args.stage]}
    result = {name: function() for name, function in selected.items()}
    print(json.dumps({"status": "PASS", "checks": result}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
