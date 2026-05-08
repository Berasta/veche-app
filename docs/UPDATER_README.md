# Краткое руководство по автообновлению

## 🚀 Быстрый старт

### 1. Первоначальная настройка
```bash
./setup-updater.sh
```

Скрипт автоматически:
- Сгенерирует ключи подписи
- Создаст директории для обновлений
- Проверит конфигурацию

### 2. Создание релиза
```bash
# Создать релиз версии 0.3.1
./release.sh 0.3.1
```

### 3. Запуск updater сервера
```bash
# Локально
npm run updater

# Production
node updater-server.js
```

### 4. Деплой на production
```bash
./deploy-update.sh
```

## 📦 Структура

```
app/
├── release.sh              # Скрипт создания релиза
├── setup-updater.sh        # Начальная настройка
├── deploy-update.sh        # Деплой на production
├── updater-server.js       # Сервер обновлений
├── Dockerfile.updater      # Docker для updater
├── nginx-updater.conf      # Nginx конфиг
└── src/
    ├── App.tsx             # UpdateNotification подключен
    ├── features/
    │   └── app-update/
    │       └── UpdateNotification.tsx
    └── shared/
        └── hooks/
            └── useAppUpdater.ts

updates/                    # Релизы (вне app/)
├── releases.json          # Метаданные
└── releases/              # Бинарники
```

## 🔧 Как это работает

### Tauri (десктоп)
1. При запуске проверяет `https://updates.weche.ru/updates/{platform}/{version}`
2. Если доступна новая версия - автоматически загружает
3. Устанавливает и перезапускает приложение

### PWA (веб)
1. Service Worker проверяет обновления
2. При наличии новой версии показывает уведомление
3. Пользователь обновляется одним кликом

## 📚 Подробная документация

См. [UPDATER_GUIDE.md](UPDATER_GUIDE.md)

## 🐳 Docker деплой

```bash
docker-compose up -d updater
```

## ⚙️ Конфигурация

### Tauri
`src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": ["https://updates.weche.ru/updates/{{target}}/{{current_version}}"],
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### PWA
`vite.config.ts`:
```ts
VitePWA({
  registerType: "autoUpdate"
})
```

## 🧪 Тестирование

1. Соберите старую версию и установите
2. Создайте новый релиз: `./release.sh 0.3.1`
3. Запустите updater: `npm run updater`
4. Откройте приложение - должно показать уведомление

## 🔒 Безопасность

- Все релизы подписываются
- Ключ хранится в `~/.tauri/veche.key`
- Никогда не коммитьте приватный ключ!

## 🆘 Проблемы

**Обновление не появляется?**
- Проверьте endpoint в конфиге
- Убедитесь что версия больше текущей
- Проверьте логи updater сервера

**Ошибка подписи?**
- Проверьте публичный ключ в конфиге
- Убедитесь что используется правильный приватный ключ
