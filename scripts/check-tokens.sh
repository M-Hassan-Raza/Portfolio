#!/usr/bin/env bash
# Fails when source files use banned styling patterns:
#   - `dark:` variants (dark mode must come from tokens flipping under .dark)
#   - opacity-modified color utilities (`bg-primary/80`, `ring-ring/50`, ...)
#   - raw z-index utilities (`z-10`, `-z-1`, `z-[999]`) or inline `z-index: <n>`
#   - white/black color literals (`text-white`, `bg-black`, ...)
# Usage: scripts/check-tokens.sh [path ...]   (defaults to src)
set -uo pipefail

cd "$(dirname "$0")/.." || exit 2

if ! command -v rg >/dev/null 2>&1; then
  echo "check-tokens: ripgrep (rg) is required" >&2
  exit 2
fi

targets=("$@")
[ ${#targets[@]} -eq 0 ] && targets=(src)

color_prefixes='bg|text|border|ring|outline|fill|stroke|from|to|via|shadow|divide|decoration|placeholder|caret|accent'
failed=0

# check <label> <pattern> [extra rg args...]
check() {
  local label=$1 pattern=$2
  shift 2
  local out status
  out=$(rg --line-number --with-filename --color=never \
    --glob '*.{ts,tsx,css}' \
    --glob '!src/routeTree.gen.ts' \
    "$@" -e "$pattern" -- "${targets[@]}")
  status=$?
  if [ "$status" -eq 0 ]; then
    echo "check-tokens: ${label}"
    printf '%s\n\n' "$out" | sed 's/^/  /'
    failed=1
  elif [ "$status" -ne 1 ]; then
    echo "check-tokens: rg failed for '${label}' (exit ${status})" >&2
    failed=1
  fi
}

check "dark: variant" '\bdark:'
# styles.css may define tokens with alpha; utilities elsewhere may not.
check "opacity color utility" "\\b(${color_prefixes})-[a-z-]+/[0-9]{1,3}\\b" --glob '!src/styles.css'
check "raw z-index utility" '(^|[^A-Za-z0-9_-])-?z-([0-9]+|\[)'
check "white/black literal" '\b(text|bg|border|fill|stroke)-(white|black)([^A-Za-z0-9_-]|$)'
check "inline z-index" '(z-index|zIndex):\s*[0-9]'

if [ "$failed" -ne 0 ]; then
  echo "check-tokens: FAILED (use named theme tokens and z tiers from src/styles.css)" >&2
  exit 1
fi

echo "check-tokens: ok"
