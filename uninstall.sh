#!/usr/bin/env bash
set -uo pipefail

# ──────────────────────────────────────────────
# NodePanel — Uninstall Script
# Removes the service and install directory.
# Data (users, audit log) is kept unless --purge.
# ──────────────────────────────────────────────

INSTALL_DIR="/opt/nodepanel"
DATA_DIR="/etc/nodepanel"
UNIT_FILE="/etc/systemd/system/nodepanel.service"
BUN_LINK="/usr/local/bin/bun"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

log()  { echo -e "${CYAN}▸${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC} $*"; }
err()  { echo -e "${RED}  ✗${NC} $*" >&2; }
warn() { echo -e "${YELLOW}  ⚠${NC} $*"; }

PURGE=0
ASSUME_YES=0

for arg in "$@"; do
  case "$arg" in
    --purge) PURGE=1 ;;
    --yes|-y) ASSUME_YES=1 ;;
    --help|-h)
      cat <<'HELP'
NodePanel uninstall

Usage:
  sudo ./uninstall.sh            Remove service + /opt/nodepanel, keep data
  sudo ./uninstall.sh --purge    Also delete /etc/nodepanel (users, audit log, logs)
  sudo ./uninstall.sh --yes      Skip confirmation prompts

Never removed: apt packages, the Bun runtime in ~/.bun, swap.

Exit codes:
  0  done (or nothing to do)
  1  must run as root
  2  aborted by user
HELP
      exit 0
      ;;
    *)
      err "Unknown option: $arg (try --help)"
      exit 1
      ;;
  esac
done

if [[ $EUID -ne 0 ]]; then
  err "This script must be run as root (or with sudo)."
  exit 1
fi

echo ""
echo -e "${BOLD}NodePanel Uninstaller${NC}"
echo ""

if [[ $PURGE -eq 1 && $ASSUME_YES -eq 0 ]]; then
  warn "Purge mode will permanently delete ${DATA_DIR}"
  warn "That includes the user database, audit log and panel logs."
  echo ""
  read -r -p "  Type 'yes' to continue: " answer
  if [[ "$answer" != "yes" ]]; then
    echo ""
    log "Aborted, nothing was changed."
    exit 2
  fi
  echo ""
fi

# ── Stop and disable the service ──
if systemctl list-unit-files nodepanel.service >/dev/null 2>&1 &&
   systemctl cat nodepanel.service >/dev/null 2>&1; then
  log "Stopping nodepanel.service..."
  systemctl stop nodepanel.service 2>/dev/null || true
  systemctl disable nodepanel.service 2>/dev/null || true
  ok "Service stopped and disabled"
else
  log "Service not registered, skipping"
fi

# ── Remove the unit file ──
if [[ -f "$UNIT_FILE" ]]; then
  log "Removing ${UNIT_FILE}..."
  rm -f "$UNIT_FILE"
  systemctl daemon-reload 2>/dev/null || true
  systemctl reset-failed nodepanel.service 2>/dev/null || true
  ok "Unit file removed"
else
  log "Unit file not found, skipping"
fi

# ── Kill leftovers not managed by systemd ──
# Match the exact install path so an unrelated bun process is never touched.
LEFTOVER=$(pgrep -f "${INSTALL_DIR}/server/index.ts" 2>/dev/null || true)
if [[ -n "$LEFTOVER" ]]; then
  warn "Found process(es) not managed by systemd: ${LEFTOVER//$'\n'/ }"
  # shellcheck disable=SC2086
  kill $LEFTOVER 2>/dev/null || true
  sleep 1
  STILL=$(pgrep -f "${INSTALL_DIR}/server/index.ts" 2>/dev/null || true)
  if [[ -n "$STILL" ]]; then
    # shellcheck disable=SC2086
    kill -9 $STILL 2>/dev/null || true
    ok "Leftover processes killed (SIGKILL)"
  else
    ok "Leftover processes stopped"
  fi
fi

# ── Remove the install directory ──
if [[ -d "$INSTALL_DIR" ]]; then
  log "Removing ${INSTALL_DIR}..."
  rm -rf "$INSTALL_DIR"
  ok "Install directory removed"
else
  log "Install directory not found, skipping"
fi

# ── Data directory (only with --purge) ──
if [[ $PURGE -eq 1 ]]; then
  if [[ -d "$DATA_DIR" ]]; then
    log "Purging ${DATA_DIR}..."
    rm -rf "$DATA_DIR"
    ok "Data directory removed"
  else
    log "Data directory not found, skipping"
  fi
else
  if [[ -d "$DATA_DIR" ]]; then
    warn "Kept ${DATA_DIR} (user database, audit log, logs)"
    warn "Run with --purge to delete it as well"
  fi
fi

# ── Bun symlink (only with --purge, and only if it points into a bun install) ──
if [[ $PURGE -eq 1 && -L "$BUN_LINK" ]]; then
  TARGET=$(readlink -f "$BUN_LINK" 2>/dev/null || true)
  case "$TARGET" in
    */.bun/bin/bun)
      log "Removing bun symlink ${BUN_LINK}..."
      rm -f "$BUN_LINK"
      ok "Symlink removed (runtime in ${TARGET%/*/*} left in place)"
      ;;
    "")
      log "Skipped dangling symlink ${BUN_LINK}"
      ;;
    *)
      warn "${BUN_LINK} points to ${TARGET}, not a bun install, leaving it"
      ;;
  esac
fi

# ── Verify ──
echo ""
log "Verifying..."
FAILED=0

if systemctl cat nodepanel.service >/dev/null 2>&1; then
  err "Unit still registered"
  FAILED=1
fi

if [[ -d "$INSTALL_DIR" ]]; then
  err "${INSTALL_DIR} still exists"
  FAILED=1
fi

if pgrep -f "${INSTALL_DIR}/server/index.ts" >/dev/null 2>&1; then
  err "A NodePanel process is still running"
  FAILED=1
fi

PORT=$(ss -tln 2>/dev/null | grep -c ':3001 ' || true)
if [[ "$PORT" != "0" ]]; then
  warn "Something is still listening on port 3001 (may be another service)"
fi

if [[ $PURGE -eq 1 && -d "$DATA_DIR" ]]; then
  err "${DATA_DIR} still exists"
  FAILED=1
fi

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}NodePanel uninstalled.${NC}"
  if [[ $PURGE -eq 0 && -d "$DATA_DIR" ]]; then
    echo "  Data kept at ${DATA_DIR}"
  fi
else
  echo -e "${RED}${BOLD}Uninstall finished with errors above.${NC}"
fi
echo ""
echo "  Not touched: apt packages, ~/.bun runtime, swap"
echo ""

exit $FAILED
