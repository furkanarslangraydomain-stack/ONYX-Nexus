import json
import logging
import math
import os
import sqlite3
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class LanceDBStore:
    """Optional LanceDB store used only when VECTOR_BACKEND=lancedb.

    The public methods match the small interface used by ONYX-Nexus memory
    components. If LanceDB cannot be initialized, callers can continue with
    the existing SQLite implementation.
    """

    def __init__(self, path: str = "./data/lancedb", table: str = "onyx_memory"):
        import lancedb

        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        self.db = lancedb.connect(path)
        self.table_name = table
        self.table = None
        if table in self.db.table_names():
            self.table = self.db.open_table(table)

    def add(self, doc_id: str, content: str, vector: List[float]) -> None:
        row = [{"id": doc_id, "content": content, "vector": vector}]
        if self.table is None:
            self.table = self.db.create_table(self.table_name, data=row)
        else:
            self.table.add(row)

    def search(self, vector: List[float], top_k: int = 2) -> List[Dict[str, Any]]:
        if self.table is None:
            return []
        return [dict(row) for row in self.table.search(vector).limit(top_k).to_list()]


class Mem0Store:
    """Optional Mem0 adapter; local SQLite remains the source of truth by default."""

    def __init__(self):
        from mem0 import Memory
        self.memory = Memory()

    def add(self, messages: List[Dict[str, str]], user_id: str = "onyx-user") -> Any:
        return self.memory.add(messages, user_id=user_id)

    def search(self, query: str, user_id: str = "onyx-user", limit: int = 5) -> Any:
        return self.memory.search(query, user_id=user_id, limit=limit)


def optional_memory_backend() -> Optional[Any]:
    backend = os.getenv("MEMORY_BACKEND", "sqlite").lower()
    if backend == "mem0":
        try:
            return Mem0Store()
        except Exception as exc:
            logger.warning("Mem0 unavailable; retaining SQLite memory: %s", exc)
    return None


def optional_vector_backend() -> Optional[LanceDBStore]:
    if os.getenv("VECTOR_BACKEND", "sqlite").lower() != "lancedb":
        return None
    try:
        return LanceDBStore(
            path=os.getenv("LANCEDB_URI", "./data/lancedb"),
            table=os.getenv("LANCEDB_TABLE", "onyx_memory"),
        )
    except Exception as exc:
        logger.warning("LanceDB unavailable; retaining SQLite vector DB: %s", exc)
        return None
