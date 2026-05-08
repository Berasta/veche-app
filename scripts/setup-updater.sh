#!/bin/bash

# Скрипт для настройки окружения автообновлений
# Использование: ./setup-updater.sh

set -euo pipefail

echo "=== Настройка системы автообновлений Вече ==="
echo ""

# 1. Проверяем наличие jq
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq не установлен. Установите его:"
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    exit 1
fi

# 2. Генерация ключей для подписи (если не существует)
KEY_PATH="$HOME/.tauri/veche.key"
if [ -f "$KEY_PATH" ]; then
    echo "✓ Ключ подписи уже существует: $KEY_PATH"
else
    echo "Генерация ключа подписи..."
    mkdir -p "$HOME/.tauri"
    npx tauri signer generate -w "$KEY_PATH"
    echo "✓ Ключ создан: $KEY_PATH"
    
    # Показываем публичный ключ
    echo ""
    echo "Добавьте публичный ключ в src-tauri/tauri.conf.json:"
    echo "  \"plugins\": {"
    echo "    \"updater\": {"
    echo "      \"pubkey\": \"$(cat $KEY_PATH.pub)\""
    echo "    }"
    echo "  }"
    echo ""
    read -p "Нажмите Enter после обновления конфига..."
fi

# 3. Создание директории для обновлений
UPDATES_DIR="$(dirname "$0")/../updates"
mkdir -p "$UPDATES_DIR/releases"
echo "✓ Директория обновлений: $UPDATES_DIR"

# 4. Создание начального releases.json
if [ ! -f "$UPDATES_DIR/releases.json" ]; then
    echo "Создание начального releases.json..."
    echo "[]" > "$UPDATES_DIR/releases.json"
    echo "✓ Создан пустой releases.json"
fi

# 5. Проверка зависимостей Node.js
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
fi

# 6. Проверка конфигурации Tauri
TAURI_CONF="src-tauri/tauri.conf.json"
if [ -f "$TAURI_CONF" ]; then
    UPDATER_ACTIVE=$(jq -r '.plugins.updater.active' "$TAURI_CONF")
    if [ "$UPDATER_ACTIVE" = "true" ]; then
        echo "✓ Tauri updater включен"
    else
        echo "⚠️  Tauri updater выключен. Включите в $TAURI_CONF"
    fi
    
    UPDATER_ENDPOINT=$(jq -r '.plugins.updater.endpoints[0]' "$TAURI_CONF")
    echo "   Endpoint: $UPDATER_ENDPOINT"
fi

echo ""
echo "=== Настройка завершена! ==="
echo ""
echo "Следующие шаги:"
echo "1. Создайте первый релиз: ./release.sh 0.1.0"
echo "2. Запустите updater сервер: npm run updater"
echo "3. Протестируйте обновление в приложении"
echo ""
echo "Для production деплоя:"
echo "1. Настройте переменные окружения в .env"
echo "2. Запустите: ./deploy-update.sh"
echo ""
echo "Документация: UPDATER_GUIDE.md"
echo ""
