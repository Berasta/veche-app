#!/bin/bash

# Скрипт для деплоя обновлений на production сервер
# Использование: ./deploy-update.sh

set -euo pipefail

REMOTE_USER="${DEPLOY_USER:-deploy}"
REMOTE_HOST="${DEPLOY_HOST:-updates.weche.ru}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/updates}"
LOCAL_UPDATES_DIR="$(dirname "$0")/../updates"

echo "=== Deploying updates to production ==="
echo "Remote: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo ""

# Проверяем наличие releases.json
if [ ! -f "$LOCAL_UPDATES_DIR/releases.json" ]; then
  echo "Error: releases.json not found in $LOCAL_UPDATES_DIR"
  exit 1
fi

# Показываем последний релиз
LATEST_VERSION=$(jq -r '.[0].version' "$LOCAL_UPDATES_DIR/releases.json")
echo "Latest version: $LATEST_VERSION"
echo ""

# Подтверждение
read -p "Deploy to production? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 0
fi

# Создаем директории на сервере
echo "Creating directories..."
ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_PATH/releases"

# Синхронизируем файлы
echo "Uploading files..."
rsync -avz --progress \
  --exclude='.git*' \
  --exclude='*.example' \
  "$LOCAL_UPDATES_DIR/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Перезапускаем updater сервер (если используется PM2)
echo "Restarting updater server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "cd /var/www/veche/app && pm2 restart updater || true"

# Проверяем что сервер работает
echo "Checking server health..."
sleep 2
if curl -f "https://$REMOTE_HOST/health" > /dev/null 2>&1; then
  echo "✓ Server is healthy"
else
  echo "✗ Warning: Server health check failed"
fi

echo ""
echo "=== Deployment complete! ==="
echo "Updater endpoint: https://$REMOTE_HOST/updates/{platform}/{version}"
echo "Releases info: https://$REMOTE_HOST/releases-info"
echo ""
