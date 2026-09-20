import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


@dataclass
class IntegrationRegistry:
    """Best-effort registry for optional upstream integrations.

    This module deliberately does not import optional packages at module load
    time. Existing ONYX-Nexus startup and fallback paths therefore remain
    unchanged on minimal Termux/Colab installations.
    """

    mem0_available: bool = False
    lancedb_available: bool = False
    guardrails_available: bool = False
    e2b_available: bool = False
    litellm_available: bool = False
    mcp_catalog_enabled: bool = False

    @classmethod
    def detect(cls) -> "IntegrationRegistry":
        def has(module: str) -> bool:
            try:
                __import__(module)
                return True
            except Exception:
                return False

        return cls(
            mem0_available=has("mem0"),
            lancedb_available=has("lancedb"),
            guardrails_available=has("guardrails"),
            e2b_available=has("e2b_code_interpreter"),
            litellm_available=has("litellm"),
            mcp_catalog_enabled=os.getenv("MCP_CATALOG_ENABLED", "false").lower() == "true",
        )

    def as_dict(self) -> Dict[str, Any]:
        return {
            "mem0": self.mem0_available,
            "lancedb": self.lancedb_available,
            "guardrails": self.guardrails_available,
            "e2b": self.e2b_available,
            "litellm": self.litellm_available,
            "mcp_catalog": self.mcp_catalog_enabled,
            "fallback_policy": "existing ONYX-Nexus implementation",
        }


_registry: Optional[IntegrationRegistry] = None


def get_integration_registry(refresh: bool = False) -> IntegrationRegistry:
    global _registry
    if _registry is None or refresh:
        _registry = IntegrationRegistry.detect()
    return _registry


def validate_json_output(payload: Any, schema: Optional[Dict[str, Any]] = None) -> Any:
    """Validate structured output with Guardrails when configured.

    Without Guardrails, JSON-like values are returned unchanged so this helper
    never becomes a hard dependency for the current request pipeline.
    """
    if schema is None or not get_integration_registry().guardrails_available:
        return payload
    try:
        from guardrails import Guard
        from guardrails.hub import JsonSchema
        guard = Guard().use(JsonSchema(schema, on_fail="exception"))
        result = guard.validate(json.dumps(payload, ensure_ascii=False))
        return result.validated_output
    except Exception as exc:
        logger.warning("Guardrails validation skipped: %s", exc)
        return payload
