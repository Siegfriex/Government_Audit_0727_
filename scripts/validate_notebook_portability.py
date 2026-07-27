#!/usr/bin/env python3
"""Static portability checks for the single submission notebook."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "P3_CULTURE_DATA_PIPELINE.ipynb"


def main() -> None:
    notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    cells = notebook.get("cells", [])
    code_cells = [cell for cell in cells if cell.get("cell_type") == "code"]
    source = "\n".join("".join(cell.get("source", [])) for cell in cells)
    outputs = "\n".join(json.dumps(cell.get("outputs", []), ensure_ascii=False) for cell in code_cells)
    execution_counts = [cell.get("execution_count") for cell in code_cells if cell.get("execution_count") is not None]

    checks = {
        "notebook_json": True,
        "single_notebook": len(list(ROOT.glob("*.ipynb"))) == 1,
        "code_cell_count": len(code_cells),
        "empty_code_cells": sum(not "".join(cell.get("source", [])).strip() for cell in code_cells),
        "continuous_execution_order": execution_counts == list(range(1, len(execution_counts) + 1)),
        "traceback_outputs": int("Traceback" in outputs or '"output_type": "error"' in outputs),
        "absolute_paths": len(re.findall(r"/home/|/Users/|[A-Za-z]:\\\\", source)),
        "sys_path_mutation": len(re.findall(r"sys\.path\.(?:append|insert)|sys\.path\s*=", source)),
        "external_project_import": len(re.findall(r"(?:from|import)\s+(?:P3_FINAL|P3_0722|P3_TARGET)", source)),
        "external_python_dependency": len(re.findall(r"(?:runpy|SourceFileLoader|spec_from_file_location).*\.py", source)),
        "network_client_usage": len(re.findall(r"(?:requests\.|urllib\.|httpx\.|wget\s|curl\s)", source)),
        "local_model_reference": "models" in source and "paraphrase-multilingual-MiniLM-L12-v2" in source,
        "seed_controls": all(token in source for token in ["PYTHONHASHSEED", "random.seed", "np.random.seed", "random_state"]),
    }

    failures = {
        key: value
        for key, value in checks.items()
        if (key in {"single_notebook", "continuous_execution_order", "local_model_reference", "seed_controls"} and value is not True)
        or (key not in {"notebook_json", "single_notebook", "code_cell_count", "continuous_execution_order", "local_model_reference", "seed_controls"} and value != 0)
    }
    result = {"status": "PASS" if not failures else "FAIL", "notebook": NOTEBOOK.name, "checks": checks, "failures": failures}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

