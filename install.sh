#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# NodePanel — All-in-One Install Script
# Target: Armbian / Debian / Ubuntu (ARM64, x86_64)
# ──────────────────────────────────────────────

REPO_URL="https://github.com/razannnnnn/nodepanel.git"
INSTALL_DIR="/opt/nodepanel"
NODEPANEL_PORT="${NODEPANEL_PORT:-3001}"
NODEPANEL_SECRET="${NODEPANEL_SECRET:-$(tr -dc A-Za-z0-9 </dev/urandom 2>/dev/null || openssl rand -hex 32)}"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BLUE='\033[0;34m'; NC='\033[0m'; BOLD='\033[1m'

log()  { echo -e "${CYAN}▸${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC} $*"; }
err()  { echo -e "${RED}  ✗${NC} $*" >&2; }
warn() { echo -e "${YELLOW}  ⚠${NC} $*"; }

# ── Banner ──
banner() {
  echo ""
  echo -e "${BLUE}      ███╗   ██╗ ██████╗ ██████╗ ███████╗${NC}"
  echo -e "${BLUE}      ████╗  ██║██╔═══██╗██╔══██╗██╔════╝${NC}"
  echo -e "${BLUE}      ██╔██╗ ██║██║   ██║██████╔╝█████╗  ${NC}"
  echo -e "${BLUE}      ██║╚██╗██║██║   ██║██╔═══╝ ██╔══╝  ${NC}"
  echo -e "${BLUE}      ██║ ╚████║╚██████╔╝██║     ███████╗${NC}"
  echo -e "${BLUE}      ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚══════╝${NC}"
  echo ""
  echo -e "         ${BOLD}Modern Linux Server Dashboard${NC}"
  echo -e "         ${CYAN}Armbian${NC} / ${CYAN}Debian${NC} / ${CYAN}Ubuntu${NC} — ARM64 / x86_64"
  echo ""
}

box_width=46
hr() { local l; printf -v l '%*s' "$box_width" ''; echo "${l// /─}"; }

header() {
  local d=$(date '+%Y-%m-%d %H:%M')
  echo ""
  echo -e "${BLUE}  ╭$(hr)╮${NC}"
  echo -e "${BLUE}  │${NC}  ${BOLD}NodePanel Installer${NC}                    ${BLUE}│${NC}"
  echo -e "${BLUE}  │${NC}  $d                ${BLUE}│${NC}"
  echo -e "${BLUE}  ╰$(hr)╯${NC}"
  echo ""
}

# Check root
if [[ $EUID -ne 0 ]]; then
  err "This script must be run as root (or with sudo)."
  exit 1
fi

# Show banner
banner
header

# ── Detect OS ──
log "Detecting OS..."
ARCH=$(uname -m)
OS_ID=$(grep -oP '^ID=\K.*' /etc/os-release 2>/dev/null | tr -d '"' || echo "unknown")
OS_VERSION=$(grep -oP '^VERSION_ID=\K.*' /etc/os-release 2>/dev/null | tr -d '"' || echo "unknown")
log "  Architecture: ${ARCH}"
log "  OS: ${OS_ID} ${OS_VERSION}"

if [[ "$OS_ID" != "debian" && "$OS_ID" != "ubuntu" && "$OS_ID" != "armbian" ]]; then
  warn "Untested OS (${OS_ID}). Continuing anyway..."
fi

# ── Install system deps ──
log "Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl git unzip openssl systemd >/dev/null 2>&1
ok "System dependencies installed"

# ── Check memory & setup swap if needed ──
TOTAL_RAM=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
TOTAL_RAM_GB=$(echo "scale=2; $TOTAL_RAM / 1024 / 1024" | bc -l 2>/dev/null || echo 0)
SWAP_EXISTS=$(swapon --show 2>/dev/null | wc -l)

if (( $(echo "$TOTAL_RAM_GB < 2" | bc -l 2>/dev/null || echo 1) )) && [[ "$SWAP_EXISTS" -eq 0 ]]; then
  warn "Low memory detected (${TOTAL_RAM_GB}G RAM, no swap)"
  log "Creating 1G swap file for build..."
  fallocate -l 1G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=1024 2>/dev/null
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null 2>&1
  swapon /swapfile >/dev/null 2>&1
  ok "Swap created (1G)"
  SWAP_CREATED=1
fi

# ── Install Bun ──
if ! command -v bun &>/dev/null; then
  log "Installing Bun runtime..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
  if [[ -f "$HOME/.bun/bin/bun" ]]; then
    ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
  fi
  ok "Bun $(bun --version) installed"
else
  ok "Bun $(bun --version) already installed"
fi

# ── Clone / copy project ──
log "Setting up project at ${INSTALL_DIR}..."
mkdir -p "$INSTALL_DIR"

# If running from within the project directory, copy instead of clone
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "$SCRIPT_DIR/package.json" ]] && grep -q '"nodepanel"' "$SCRIPT_DIR/package.json" 2>/dev/null; then
  log "Copying local project..."
  rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' "$SCRIPT_DIR/" "$INSTALL_DIR/"
else
  log "Cloning from repository..."
  if [[ -d "$INSTALL_DIR/.git" ]]; then
    cd "$INSTALL_DIR" && git pull
  else
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi
fi

cd "$INSTALL_DIR"

# ── Install JS dependencies ──
log "Installing JavaScript dependencies..."
bun install --production 2>&1 | tail -1
ok "Dependencies installed"

# ── Build frontend ──
log "Building frontend..."
bun run build 2>&1 | tail -1
ok "Frontend built"

# ── Create data directory ──
DATA_DIR="/etc/nodepanel"
mkdir -p "$DATA_DIR/logs"
chmod 750 "$DATA_DIR"
ok "Data directory created at ${DATA_DIR}"

# ── Create .env ──
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  cat > "$INSTALL_DIR/.env" <<EOF
NODEPANEL_PORT=${NODEPANEL_PORT}
NODEPANEL_HOST=0.0.0.0
NODEPANEL_DATA_DIR=${DATA_DIR}
NODEPANEL_SECRET=${NODEPANEL_SECRET}
EOF
  ok "Configuration created"
fi

# ── Create systemd service ──
log "Creating systemd service..."
cat > /etc/systemd/system/nodepanel.service <<'SERVICEEOF'
[Unit]
Description=NodePanel - Modern Linux Server Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nodepanel
ExecStart=/usr/local/bin/bun run server/index.ts
Restart=always
RestartSec=5
EnvironmentFile=/opt/nodepanel/.env
StandardOutput=append:/etc/nodepanel/logs/panel.log
StandardError=append:/etc/nodepanel/logs/panel-error.log

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable nodepanel.service
systemctl start nodepanel.service
ok "systemd service created and started"

# ── Wait for startup ──
log "Waiting for NodePanel to start..."
sleep 3
if systemctl is-active --quiet nodepanel.service; then
  ok "NodePanel is running!"
else
  warn "Service may not have started. Check: systemctl status nodepanel.service"
fi

# ── Print info ──
box_out() {
  local label="$1" val="$2" color="${3:-}"
  local visible="${label}:  ${val}"
  local pad=$((box_width - ${#visible}))
  printf "${GREEN}  │${NC}  ${color}%s${NC}%${pad}s${GREEN}│${NC}\n" "$visible" ""
}

IP=$(ip -4 addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
url="http://${IP:-0.0.0.0}:${NODEPANEL_PORT}"

echo ""
echo -e "${GREEN}  ╭$(hr)╮${NC}"
printf "${GREEN}  │${NC}  ${BOLD}%s${NC}%$((box_width - 19))s${GREEN}│${NC}\n" "NodePanel Installed!" ""
echo -e "${GREEN}  ├$(hr)┤${NC}"
printf "${GREEN}  │${NC}  %${box_width}s${GREEN}│${NC}\n" ""
box_out "URL" "$url" "$CYAN"
printf "${GREEN}  │${NC}  %${box_width}s${GREEN}│${NC}\n" ""
box_out "User" "admin" "$YELLOW"
box_out "Pass" "nodepanel" "$YELLOW"
printf "${GREEN}  │${NC}  %${box_width}s${GREEN}│${NC}\n" ""
box_out "Config" "$DATA_DIR"
box_out "Logs" "$DATA_DIR/logs"
printf "${GREEN}  │${NC}  %${box_width}s${GREEN}│${NC}\n" ""
echo -e "${GREEN}  ╰$(hr)╯${NC}"
echo ""
echo -e "  ${CYAN}▸${NC} Run ${YELLOW}journalctl -fu nodepanel.service${NC} to follow logs"
echo ""
