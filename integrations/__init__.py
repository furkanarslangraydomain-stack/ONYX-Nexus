"""Optional ONYX-Nexus integrations.

All integrations are opt-in and preserve the existing SQLite, subprocess and
HTTP fallbacks when their dependencies or credentials are unavailable.
"""

from .optional_backends import IntegrationRegistry, get_integration_registry

__all__ = ["IntegrationRegistry", "get_integration_registry"]
