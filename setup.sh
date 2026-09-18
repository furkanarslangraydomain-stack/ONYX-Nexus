#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Onyx-Nexus Multi-Agent Ecosystem - Termux Production Setup Script
# Architecture: Android (Termux) Low-RAM Orchestration Engine
# ==============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   ONYX-NEXUS: Termux Deployment & Setup Pipeline   ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Acquire Termux Wake-Lock to prevent Android OS CPU throttling
if command -v termux-wake-lock >/dev/null 2>&1; then
    echo -e "${YELLOW}[+] Acquiring Termux wake-lock to keep background daemon alive...${NC}"
    termux-wake-lock
else
    echo -e "${YELLOW}[!] Notice: termux-wake-lock command not found. Install 'termux-api' if background execution drops.${NC}"
fi

# 2. Update Termux Package Repositories
echo -e "${YELLOW}[+] Updating package lists and upgrading core utilities...${NC}"
pkg update -y && pkg upgrade -y

# 3. Install Python and native compilation dependencies
# Note: On aarch64 Android, libraries like httpx, cryptography, and e2b_code_interpreter
# may require native compilation tools (clang, rust, libffi, openssl).
echo -e "${YELLOW}[+] Installing Python 3, Clang, Rust, and Native Build Dependencies...${NC}"
pkg install -y python python-pip git clang build-essential libffi openssl rust libxml2 libxslt

# Verify Python installation
PYTHON_VERSION=$(python3 --version 2>&1 || true)
echo -e "${GREEN}[✓] Python detected: ${PYTHON_VERSION}${NC}"

# 4. Upgrade pip and wheel
echo -e "${YELLOW}[+] Upgrading pip, setuptools, and wheel...${NC}"
python3 -m pip install --upgrade pip setuptools wheel --break-system-packages

# 5. Install Required Lightweight Python Dependencies
# Strict constraint: No LangChain, No CrewAI, No AutoGen, No heavy ORMs
echo -e "${YELLOW}[+] Installing Onyx-Nexus lightweight Python dependencies...${NC}"
python3 -m pip install --break-system-packages \
    "fastapi>=0.110.0" \
    "uvicorn[standard]>=0.28.0" \
    "httpx>=0.27.0" \
    "e2b-code-interpreter>=1.0.0" \
    "pydantic>=2.6.0" \
    "python-dotenv>=1.0.1"

echo -e "${GREEN}[✓] Python dependencies successfully installed.${NC}"

# 6. Initialize .env if not present
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[+] Creating default .env configuration file...${NC}"
    cat << 'EOF' > .env
# Onyx-Nexus Environment Configuration
# 1. Primary: Centralized API Pool (Optional - If left empty, embedded zero-key Pollinations AI pool is used)
API_POOL_BASE_URL=""
API_POOL_KEY=""
API_POOL_MODEL="onyx-pool-auto"

# 2. Execution Engine: "piston" (100% Free Public Cloud Sandbox, no key required) or "e2b"
EXECUTION_ENGINE="piston"
E2B_API_KEY=""

# 3. Memory & Logging: Notion API (optional, defaults to local memory.jsonl)
NOTION_API_KEY=""
NOTION_DATABASE_ID=""

# 4. Fallback Direct Vendor Keys (optional)
GROQ_API_KEY=""
GEMINI_API_KEY=""

# Server Configuration
HOST="0.0.0.0"
PORT=8000
EOF
    echo -e "${GREEN}[✓] .env generated. Remember to edit it with: nano .env${NC}"
else
    echo -e "${CYAN}[i] .env already exists. Skipping creation.${NC}"
fi

# 7. Create convenient start script for single-worker low-RAM execution
cat << 'EOF' > start.sh
#!/data/data/com.termux/files/usr/bin/bash
# Starts Uvicorn with 1 worker to strictly preserve Android RAM
if command -v termux-wake-lock >/dev/null 2>&1; then
    termux-wake-lock
fi

echo "Starting Onyx-Nexus Orchestration Server on 0.0.0.0:8000..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --timeout-keep-alive 65
EOF
chmod +x start.sh

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}   ONYX-NEXUS INSTALLATION COMPLETED SUCCESSFULLY!  ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "Next steps:"
echo -e "  1. Configure your API keys: ${CYAN}nano .env${NC}"
echo -e "  2. Start the daemon:        ${CYAN}./start.sh${NC} (or ${CYAN}uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1${NC})"
echo -e "  3. Check your local IP:     ${CYAN}ifconfig wlan0 | grep 'inet '${NC}"
