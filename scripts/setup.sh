#!/usr/bin/env bash
# First-run setup for the Kanban docker compose stack.
# Mirror of scripts/setup.ps1 for WSL/Linux/macOS users.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
env_file="$repo_root/.env"
template="$repo_root/.env.docker"

if [ ! -f "$template" ]; then
  echo "[setup] .env.docker template not found at $template" >&2
  exit 1
fi

if [ ! -f "$env_file" ]; then
  cp "$template" "$env_file"
  echo "[setup] Created .env from .env.docker"
else
  echo "[setup] .env already exists — leaving it alone"
fi

random_hex() {
  # $1 = number of bytes
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$1"
  else
    head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

# Replace a key's value only if it still equals the template placeholder.
set_if_placeholder() {
  local key="$1" placeholder="$2" new_value="$3"
  if grep -q "^${key}=${placeholder}\$" "$env_file"; then
    # Use a sed delimiter unlikely to appear in hex strings.
    sed -i.bak "s|^${key}=${placeholder}\$|${key}=${new_value}|" "$env_file"
    rm -f "${env_file}.bak"
    echo "[setup] Generated random $key"
  fi
}

set_if_placeholder JWT_SECRET        'change_me_very_long_random_secret' "$(random_hex 64)"
set_if_placeholder POSTGRES_PASSWORD 'change_me_strong_password'          "$(random_hex 24)"

# Critical placeholders that the script cannot auto-fill.
critical_keys=(GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET)
remaining=()
for key in "${critical_keys[@]}"; do
  if grep -q "^${key}=change_me_" "$env_file"; then
    remaining+=("$key")
  fi
done

if [ "${#remaining[@]}" -gt 0 ]; then
  echo ""
  echo "[setup] The following keys still contain placeholders in .env:" >&2
  for key in "${remaining[@]}"; do echo "  - $key" >&2; done
  echo "Edit .env and replace them before running 'docker compose up'." >&2
  echo "Google credentials: https://console.cloud.google.com/apis/credentials" >&2
  exit 1
fi

echo ""
echo "[setup] Ready. Next: docker compose up --build"
