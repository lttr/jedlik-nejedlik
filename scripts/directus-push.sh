#!/usr/bin/env bash
# Push the e-mail templates in directus/templates/ and the extensions in
# directus/extensions/ to the Directus instance as Coolify **file storages** —
# one bind-mounted file per repo file, content taken from this repo. The repo is
# the source of truth; re-running overwrites what is on the server (see
# docs/directus.md).
#
# Both directories are already persistent volumes on the service, so a file
# mounted underneath one simply appears inside it.
#
# Needs the `coolify` CLI authenticated (`coolify context`) — no SSH.
set -euo pipefail

# The Coolify service and, inside it, the application container to mount into.
# Both are looked up by name — no uuids in source, they differ per instance.
SERVICE_NAME="${COOLIFY_DIRECTUS_SERVICE:-directus}"
APP_NAME="${COOLIFY_DIRECTUS_APP:-directus}"
# Directus's EMAIL_TEMPLATES_PATH and EXTENSIONS_PATH, both relative to /directus.
TEMPLATES_DIR="/directus/templates"
EXTENSIONS_DIR="/directus/extensions"

# One call carries both: the service and the applications it runs.
service="$(coolify service list --format json |
  jq --arg name "$SERVICE_NAME" 'map(select(.name == $name)) | .[0]')"
[[ "$service" != "null" ]] || {
  echo "No Coolify service named '$SERVICE_NAME'. Is the CLI pointed at the right context?" >&2
  exit 1
}
SERVICE_UUID="$(jq -r '.uuid' <<<"$service")"
RESOURCE_UUID="$(jq -r --arg name "$APP_NAME" \
  '.applications | map(select(.name == $name)) | .[0].uuid // empty' <<<"$service")"
[[ -n "$RESOURCE_UUID" ]] || {
  echo "Service '$SERVICE_NAME' has no application named '$APP_NAME'." >&2
  exit 1
}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
storages="$(coolify service storage list "$SERVICE_UUID" --format json)"
created=0
created_paths=()
extensions_changed=0

# sync_file <local path> <mount path> — prints what it did, echoes "changed"
# into the caller's tally via the globals above.
sync_file() {
  local file="$1" mount_path="$2"
  local content uuid remote
  content="$(cat "$file")"
  uuid="$(jq -r --arg p "$mount_path" \
    'map(select(.mount_path == $p and .type == "file")) | .[0].uuid // empty' <<<"$storages")"

  if [[ -z "$uuid" ]]; then
    coolify service storage create "$SERVICE_UUID" \
      --resource-uuid "$RESOURCE_UUID" --type file \
      --mount-path "$mount_path" --content "$content" >/dev/null
    echo "created    $mount_path"
    created=1
    created_paths+=("$mount_path")
    return 0
  fi

  # The listing carries the stored content, so an unchanged file is a no-op —
  # which is what keeps the restart hint below honest.
  remote="$(jq -r --arg p "$mount_path" \
    'map(select(.mount_path == $p and .type == "file")) | .[0].content' <<<"$storages")"
  if [[ "$remote" == "$content" ]]; then
    echo "unchanged  $mount_path"
    return 1
  fi

  coolify service storage update "$SERVICE_UUID" \
    --uuid "$uuid" --type file --content "$content" >/dev/null
  echo "updated    $mount_path"
}

for template in "$ROOT"/directus/templates/*.liquid; do
  sync_file "$template" "$TEMPLATES_DIR/$(basename "$template")" || true
done

# Every file of every extension, minus anything installed rather than authored.
while IFS= read -r source; do
  sync_file "$source" "$EXTENSIONS_DIR/${source#"$ROOT"/directus/extensions/}" &&
    extensions_changed=1 || true
done < <(find "$ROOT/directus/extensions" -type f -not -path '*/node_modules/*' | sort)

if [[ "$created" == 1 ]]; then
  # Creating a file storage does NOT mount it: for a *service*, Coolify renders
  # the compose from `docker_compose_raw`, so a storage the compose does not
  # name is stored and never bind-mounted. Verified on this instance — the
  # extension files sat in the storage list while the container saw nothing.
  echo
  echo "New file storage created — it is NOT mounted yet."
  echo "Add the bind mount to the service's compose (Coolify UI → the service →"
  echo "Compose file), under the 'directus' service's volumes:, then deploy:"
  for path in "${created_paths[@]}"; do
    echo "  - '.$path:$path'"
  done
  echo "  coolify deploy uuid $SERVICE_UUID"
elif [[ "$extensions_changed" == 1 ]]; then
  # Extensions are registered at boot (EXTENSIONS_AUTO_RELOAD is off), unlike
  # templates, which Directus reads from disk on every send.
  echo
  echo "Extension code changed — restart the service to load it:"
  echo "  coolify service restart $SERVICE_UUID"
fi
