# Onyx-Nexus: Termux & Open WebUI Integration Technical Guide

A low-RAM, serverless multi-agent architecture running natively inside Android Termux, providing an OpenAI-compatible endpoint for Open WebUI.

---

## 1. Prerequisites on Android Device

1. **Install Termux**: Install from **F-Droid** or GitHub Releases (avoid the deprecated Google Play Store build).
2. **Install Termux:API (Recommended)**: Enables `termux-wake-lock` to keep the CPU awake in the background.
3. **Disable Battery Optimization**:
   - Go to Android Settings → Apps → Termux → Battery → Select **Unrestricted**.

---

## 2. Termux Deployment (Execution Sequence)

### Step 2.1: Clone or Copy Files to Termux
Open Termux on your phone and create the project workspace:
```bash
mkdir -p ~/onyx-nexus && cd ~/onyx-nexus
```
Download or transfer `setup.sh` and `main.py` to `~/onyx-nexus`.

### Step 2.2: Run the Setup Script
Make the setup script executable and run it:
```bash
chmod +x setup.sh
./setup.sh
```
This script installs Python, Clang, Rust, build utilities, and the lightweight Python dependencies (`fastapi`, `uvicorn[standard]`, `httpx`, `e2b-code-interpreter`, `python-dotenv`, `pydantic`).

### Step 2.3: Configure API Keys in `.env`
Edit your `.env` file inside Termux:
```bash
nano .env
```
Provide the following credentials:
```env
# Fast LLM Inference (Groq or Gemini)
GROQ_API_KEY="gsk_..."
# Optional alternative/fallback:
GEMINI_API_KEY="AIzaSy..."

# E2B Sandbox (Required for Phase 3 code runner)
E2B_API_KEY="e2b_..."

# Notion Integration (Required for Phase 4 persistent state logging)
NOTION_API_KEY="secret_..."
NOTION_DATABASE_ID="your_database_32_character_id"

# Server Bindings
HOST="0.0.0.0"
PORT=8000
```
Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

---

## 3. Starting the Uvicorn Server in Termux

Execute either the helper script or the direct uvicorn command:

### Option A: Using the generated runner
```bash
./start.sh
```

### Option B: Direct Uvicorn command
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --timeout-keep-alive 65
```

> **Low-RAM Note**: Do NOT increase `--workers` beyond `1`. Android memory management will kill child processes under memory pressure. Uvicorn with 1 worker handles async I/O efficiently on mobile hardware.

---

## 4. Discovering the Phone's Local Network IP

Verify your Android device and your Open WebUI host (PC/Mac/Server) are connected to the same Wi-Fi network.

In Termux (or in a new Termux session):
```bash
ifconfig wlan0 | grep "inet "
```
*Or:*
```bash
ip -4 addr show wlan0 | grep inet
```
Example output:
```text
inet 192.168.1.145  netmask 255.255.255.0  broadcast 192.168.1.255
```
Your phone's IP address in this example is `192.168.1.145`.

---

## 5. Configuring Open WebUI Connection

### Method A: Via Open WebUI Web Interface
1. Open your Open WebUI instance in your browser.
2. Log in as Admin and navigate to:
   **Admin Panel → Settings → Connections → OpenAI API**.
3. Toggle on **OpenAI API**.
4. Configure the parameters:
   - **API Base URL**: `http://192.168.1.145:8000/v1` *(replace with your phone's IP)*
   - **API Key**: `onyx-nexus-termux` *(any non-empty string)*
5. Click the **Verify Connection** (refresh) icon.
   - Open WebUI will query `GET /v1/models` and discover `onyx-nexus-agent`.
6. Click **Save**.

### Method B: Via Docker / Docker Compose Environment
If launching Open WebUI via Docker, configure:
```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_BASE_URL=http://192.168.1.145:8000/v1
      - OPENAI_API_KEY=onyx-nexus-termux
    restart: unless-stopped
```

---

## 6. LAN Verification Test (from PC or Terminal)

From any computer on the same Wi-Fi network, test the connection via `curl`:

```bash
# 1. Health & Configuration Check
curl -s http://192.168.1.145:8000/health | jq .

# 2. Model Discovery Check
curl -s http://192.168.1.145:8000/v1/models | jq .

# 3. Test Multi-Agent Execution Pipeline
curl -X POST http://192.168.1.145:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "onyx-nexus-agent",
    "messages": [
      {"role": "user", "content": "Write a Python script to compute the first 10 Fibonacci numbers and print the sum."}
    ],
    "stream": false
  }' | jq .
```

---

## 7. Notion Database Schema Requirements

For Phase 4 (Reporter Agent), ensure your Notion database contains the following properties:
- **Title** (Type: `title`)
- **Status** (Type: `select`, options: `SUCCESS`, `FAILED`)
- **Retries** (Type: `number`)

Invite your Notion internal integration to the target database via the **Share / Connections** menu in Notion.
