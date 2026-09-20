# ONYX-Nexus Optional Integrations

The integrations are additive and feature-flagged. The existing SQLite FTS5
memory, Piston HTTP sandbox, local subprocess fallback, LiteLLM router, and
Mega MCP server remain the default path.

## Enablement

Install optional adapters only when needed:

```bash
pip install -r integrations/requirements-optional.txt
```

Environment flags:

```dotenv
# Default values preserve the current architecture.
MEMORY_BACKEND=sqlite       # sqlite | mem0
VECTOR_BACKEND=sqlite       # sqlite | lancedb
LANCEDB_URI=./data/lancedb
LANCEDB_TABLE=onyx_memory
MCP_CATALOG_ENABLED=false
EXECUTION_ENGINE=piston     # piston | e2b | colab | local
```

- **mem0** is an optional long-term memory adapter; SQLite FTS5 remains the
  source of truth unless `MEMORY_BACKEND=mem0` is explicitly selected.
- **LanceDB** is an optional vector backend; the existing `vector_db.py`
  behavior is unchanged unless `VECTOR_BACKEND=lancedb` is selected.
- **Piston** remains an HTTP integration and requires no package installation.
- **E2B**, **LiteLLM**, and the existing ONYX-Nexus MCP implementation are
  already integrated with graceful fallbacks.
- **Guardrails** is available through the optional structured-output helper;
  validation failures never take down the primary request path.
- The upstream `modelcontextprotocol/servers` repository is treated as an
  external MCP catalog. Individual servers should be configured explicitly and
  never run with unrestricted filesystem or shell access.

Never commit API keys. Use `.env` or the deployment secret manager.
