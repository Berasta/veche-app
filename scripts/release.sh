#!/usr/bin/env bash
set -euo pipefail

APP_NAME="veche"
VERSION="${1:-}"
UPDATER_DIR="$(dirname "$0")/../updates"
KEY="$HOME/.tauri/veche.key"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.0"
  exit 1
fi

if [ ! -f "$KEY" ]; then
  echo "Private key not found at $KEY"
  echo "Generate one with: npx tauri signer generate -w ~/.tauri/veche.key"
  exit 1
fi

echo "=== Updating app version to $VERSION ==="
jq ".version = \"$VERSION\"" src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp
mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json

# Также обновляем package.json (опционально)
jq ".version = \"$VERSION\"" package.json > package.json.tmp
mv package.json.tmp package.json

echo "=== Building Tauri app ==="
npm run tauri build

echo "=== Signing artifacts ==="
mkdir -p "$UPDATER_DIR/releases"
RELEASE_JSON="$UPDATER_DIR/releases.json"

# Создаем массив для хранения подписей
declare -A SIGNATURES

# Подписываем все бинарники
for f in src-tauri/target/release/bundle/**/*.{dmg,msi,exe,AppImage,deb}; do
  [ -f "$f" ] || continue
  
  sig=$(npx tauri signer sign -k "$KEY" -f "$f" 2>/dev/null | tail -n1)
  basename_file=$(basename "$f")
  
  # Определяем платформу по расширению
  platform=""
  case "$basename_file" in
    *.dmg)
      if [[ "$basename_file" == *"aarch64"* ]]; then
        platform="darwin-aarch64"
      else
        platform="darwin-x86_64"
      fi
      ;;
    *-setup.exe|*.msi)
      platform="windows-x86_64"
      ;;
    *.AppImage)
      platform="linux-x86_64"
      ;;
  esac
  
  if [ -n "$platform" ]; then
    SIGNATURES["$platform|file"]="$basename_file"
    SIGNATURES["$platform|sig"]="$sig"
    
    # Копируем файл
    cp "$f" "$UPDATER_DIR/releases/$basename_file"
    echo "✓ Signed and copied: $basename_file ($platform)"
  fi
done

echo ""
echo "=== Generating releases.json ==="

# Генерируем или обновляем releases.json
TEMP_JSON=$(mktemp)

# Создаем новую запись релиза
cat > "$TEMP_JSON" <<EOF
{
  "version": "$VERSION",
  "notes": "Обновление до версии $VERSION",
  "pub_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "platforms": {
EOF

first=true
for key in "${!SIGNATURES[@]}"; do
  platform="${key%%|*}"
  type="${key##*|}"
  
  if [ "$type" = "file" ]; then
    filename="${SIGNATURES[$key]}"
    sig="${SIGNATURES[$platform|sig]}"
    
    if [ "$first" = true ]; then
      first=false
    else
      echo "," >> "$TEMP_JSON"
    fi
    
    cat >> "$TEMP_JSON" <<EOF
    "$platform": {
      "signature": "$sig",
      "url": "/releases/$filename"
    }
EOF
  fi
done

cat >> "$TEMP_JSON" <<EOF

  }
}
EOF

# Объединяем с существующим releases.json
if [ -f "$RELEASE_JSON" ]; then
  # Читаем существующий массив
  existing=$(cat "$RELEASE_JSON")
  new_release=$(cat "$TEMP_JSON")
  
  # Объединяем
  echo "$existing" | jq --argjson new "$new_release" '. = [$new] + .' > "$RELEASE_JSON.tmp"
  mv "$RELEASE_JSON.tmp" "$RELEASE_JSON"
else
  # Создаем новый массив
  jq -n --argjson release "$(cat $TEMP_JSON)" '[$release]' > "$RELEASE_JSON"
fi

rm "$TEMP_JSON"

echo "✓ Updated $RELEASE_JSON"
echo ""
echo "=== Release $VERSION created successfully! ==="
echo ""
echo "Files created in: $UPDATER_DIR/releases/"
echo "Release metadata: $RELEASE_JSON"
echo ""
echo "Next steps:"
echo "1. Review the generated releases.json"
echo "2. Test the updater server: node updater-server.js"
echo "3. Deploy to production server"
echo "4. Git commit and push changes"
echo ""

