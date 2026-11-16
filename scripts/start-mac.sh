#!/usr/bin/env bash
# ================================================================
# TubePulse - YouTube Analytics Studio (macOS / Linux Launcher)
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${YELLOW}       TubePulse - YouTube Channel & Competitor Analytics       ${NC}"
echo -e "${CYAN}                  [ macOS Environment Launcher ]                ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH!${NC}"
    echo -e "Install via Homebrew:"
    echo -e "    ${YELLOW}brew install node${NC}"
    echo -e "Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[1/3] Node.js detected: $(node -v)${NC}"

# 2. Setup .env.local if not present
cd "$(dirname "$0")/.."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[2/3] Setting up local environment (.env.local)...${NC}"
    if [ -f ".env.mac.example" ]; then
        cp ".env.mac.example" ".env.local"
    elif [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
    fi
    echo -e "${GREEN}      Created .env.local from macOS template.${NC}"
else
    echo -e "${GREEN}[2/3] Environment file .env.local already configured.${NC}"
fi

# 3. Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[3/3] Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}[3/3] Dependencies verified.${NC}"
fi

echo ""
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN} Starting Next.js Server on http://localhost:3000 ...${NC}"
echo -e " Press Ctrl+C to stop the server at any time."
echo -e "${CYAN}================================================================${NC}"
echo ""

if command -v open &> /dev/null; then
    (sleep 2 && open "http://localhost:3000") &
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open "http://localhost:3000") &
fi

npm run dev
