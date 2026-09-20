# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"

# PRIMARY: Centralized API Pool / LiteLLM / Custom Router Endpoint
# Point this to your load balancer, LiteLLM, One-API, or custom multi-provider gateway
API_POOL_BASE_URL="http://192.168.1.100:4000/v1"
API_POOL_KEY="sk-pool-secret"
API_POOL_MODEL="onyx-pool-auto"

# EXECUTION_ENGINE: "piston" (100% Free Public Cloud Sandbox, no key required) or "e2b"
EXECUTION_ENGINE="piston"

# OPTIONAL INTEGRATION FLAGS: preserve current ONYX-Nexus behavior by default.
# Use sqlite unless explicitly changed.
MEMORY_BACKEND="sqlite"        # sqlite | mem0
VECTOR_BACKEND="sqlite"        # sqlite | lancedb
LANCEDB_URI="./data/lancedb"
LANCEDB_TABLE="onyx_memory"
MEMORY_USER_ID="onyx-user"
MCP_CATALOG_ENABLED="false"   # true | false

# E2B_API_KEY: Optional E2B cloud sandbox API key (only if EXECUTION_ENGINE=e2b)
E2B_API_KEY=""

# NOTION_API_KEY: Optional Notion token for Phase 4 state reporter (defaults to local memory.jsonl)
NOTION_API_KEY=""
NOTION_DATABASE_ID=""

# Fallback direct vendor keys (only used if API_POOL_BASE_URL is unreachable)
GROQ_API_KEY=""
GEMINI_API_KEY=""
OPENROUTER_API_KEY=""

# HOST and PORT for Onyx-Nexus Termux daemon
HOST="0.0.0.0"
PORT=8000

# Optional external MCP catalog integration (read-only catalog hints, no shell access by default)
# Example: modelcontextprotocol/servers, e2b-dev/E2B, engineer-man/piston, etc.
# This is only catalog metadata and must be explicitly authorized in your environment.

# Note: if you want to use mem0 or LanceDB, install:
# pip install -r integrations/requirements-optional.txt

# Onyx-Nexus keeps the legacy SQLite / Piston / local fallback path as the default.
# The optional adapters remain opt-in and safe by design.

# the above duplicates are intentionally kept for compatibility with AI Studio secrets
# and local .env setups.

# Example usage:
# MEMORY_BACKEND=mem0
# VECTOR_BACKEND=lancedb
# MCP_CATALOG_ENABLED=true
# EXECUTION_ENGINE=piston

# NOTE: Do not commit real API credentials to version control.
