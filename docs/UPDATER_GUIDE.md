# Автообновление Вече

Система автоматических обновлений для Tauri приложения и PWA веб-версии.

## 🚀 Быстрый старт

### 1. Генерация ключей для подписи (один раз)

```bash
npx tauri signer generate -w ~/.tauri/veche.key
```

Сохраните публичный ключ и добавьте его в `src-tauri/tauri.conf.json` в поле `plugins.updater.pubkey`.

### 2. Создание релиза

```bash
# Сборка и подпись релиза версии 0.3.1
./release.sh 0.3.1
```

Скрипт автоматически:
- Обновит версию в `tauri.conf.json` и `package.json`
- Соберет приложение для всех платформ
- Подпишет бинарники
- Создаст/обновит `../updates/releases.json`
- Скопирует файлы в `../updates/releases/`

### 3. Запуск updater сервера

```bash
# Локально для тестирования
node updater-server.js

# На production сервере
PORT=3002 node updater-server.js
```

Сервер будет доступен на `http://localhost:3002`

### 4. Деплой на production

**Вариант A: Отдельный сервер**

```bash
# На production сервере
cd /path/to/updates
node updater-server.js
```

Настройте nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name updates.weche.ru;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Вариант B: Вместе с основным приложением**

Обновите `server.js` или `nginx.conf` для проксирования `/updates/*` на updater сервер.

---

## 📦 Структура обновлений

### Директории

```
updates/
├── releases.json          # Метаданные всех релизов
├── releases.json.example  # Пример структуры
└── releases/              # Бинарные файлы
    ├── veche_0.3.0_aarch64.dmg
    ├── veche_0.3.0_x64.dmg
    ├── veche_0.3.0_x64-setup.exe
    └── veche_0.3.0_amd64.AppImage
```

### Формат releases.json

```json
[
  {
    "version": "0.3.1",
    "notes": "Описание изменений",
    "pub_date": "2026-05-08T12:00:00Z",
    "platforms": {
      "darwin-aarch64": {
        "signature": "BASE64_SIGNATURE",
        "url": "/releases/veche_0.3.1_aarch64.dmg"
      },
      "darwin-x86_64": {
        "signature": "BASE64_SIGNATURE",
        "url": "/releases/veche_0.3.1_x64.dmg"
      },
      "windows-x86_64": {
        "signature": "BASE64_SIGNATURE",
        "url": "/releases/veche_0.3.1_x64-setup.exe"
      },
      "linux-x86_64": {
        "signature": "BASE64_SIGNATURE",
        "url": "/releases/veche_0.3.1_amd64.AppImage"
      }
    }
  }
]
```

---

## 🖥️ Tauri приложение

### Как работает

1. При запуске приложение проверяет обновления через `useAppUpdater` хук
2. Делает запрос на `https://updates.weche.ru/updates/{platform}/{version}`
3. Если доступна новая версия:
   - Автоматически загружает обновление
   - Показывает прогресс загрузки
   - Устанавливает и перезапускает приложение

### Настройка в коде

```tsx
import { UpdateNotification } from "@features/app-update/UpdateNotification";

// В App.tsx уже добавлено
<UpdateNotification />
```

### Конфигурация

В `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://updates.weche.ru/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

---

## 🌐 PWA (веб-версия)

### Как работает

1. Service Worker автоматически проверяет обновления
2. При обнаружении новой версии показывает уведомление
3. Пользователь может обновиться одним кликом
4. Страница перезагружается с новой версией

### Настройка

В `vite.config.ts` уже настроено:

```ts
VitePWA({
  registerType: "autoUpdate",
  // ...
})
```

### Кеширование

Service Worker кеширует:
- Статические файлы (JS, CSS, шрифты)
- Изображения (30 дней)
- API запросы (5 минут)

---

## 🔧 CI/CD интеграция

### GitHub Actions пример

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Tauri app
        run: npm run tauri build
      
      - name: Sign and upload
        env:
          TAURI_SIGNING_KEY: ${{ secrets.TAURI_SIGNING_KEY }}
        run: |
          # Подпись и загрузка на updater сервер
          ./scripts/sign-and-upload.sh
```

### GitLab CI пример

```yaml
release:
  stage: deploy
  only:
    - tags
  script:
    - npm ci
    - npm run tauri build
    - ./release.sh $CI_COMMIT_TAG
    - rsync -av ../updates/ user@updates.weche.ru:/var/updates/
```

---

## 🧪 Тестирование

### Локальное тестирование

1. Запустите updater сервер:
   ```bash
   node updater-server.js
   ```

2. Измените endpoint в `tauri.conf.json`:
   ```json
   {
     "endpoints": ["http://localhost:3002/updates/{{target}}/{{current_version}}"]
   }
   ```

3. Создайте старую версию, соберите и установите:
   ```bash
   # Установите версию 0.2.0
   jq '.version = "0.2.0"' src-tauri/tauri.conf.json > tmp.json
   mv tmp.json src-tauri/tauri.conf.json
   npm run tauri build
   # Установите приложение
   ```

4. Создайте новый релиз:
   ```bash
   ./release.sh 0.3.0
   ```

5. Запустите приложение - должно показать уведомление об обновлении

### Проверка endpoints

```bash
# Проверка наличия обновления
curl http://localhost:3002/updates/darwin-aarch64/0.2.0

# Список релизов
curl http://localhost:3002/releases-info

# Healthcheck
curl http://localhost:3002/health
```

---

## 📱 Платформы

### Поддерживаемые

- **macOS** (Intel & Apple Silicon)
  - `.dmg` установщик
  - Автообновление через Tauri updater

- **Windows** (x64)
  - `.exe` NSIS установщик
  - Автообновление через Tauri updater

- **Linux** (x64)
  - `.AppImage` portable
  - `.deb` пакет (опционально)
  - Автообновление через Tauri updater

- **Web/PWA**
  - Service Worker автообновление
  - Работает в любом современном браузере

---

## 🔒 Безопасность

### Подписи

Все релизы подписываются приватным ключом:
- Ключ храните в безопасности (`~/.tauri/veche.key`)
- Никогда не коммитьте в Git
- В CI/CD используйте секреты

### Проверка подписей

Tauri автоматически проверяет подписи при обновлении используя публичный ключ из конфигурации.

---

## 📊 Мониторинг

### Логи updater сервера

Сервер логирует все запросы:
```
[2026-05-08T12:00:00Z] GET /updates/darwin-aarch64/0.2.0
Checking update for darwin-aarch64, current version: 0.2.0
Update available: 0.3.0
```

### Метрики (опционально)

Добавьте сбор метрик в `updater-server.js`:
- Количество проверок обновлений
- Количество загрузок
- Популярные платформы
- Ошибки при обновлении

---

## ❓ FAQ

**Q: Как откатиться к предыдущей версии?**
A: Удалите новую запись из `releases.json` или измените версию на старую.

**Q: Можно ли отключить автообновление?**
A: Да, установите `"active": false` в `tauri.conf.json` или не добавляйте `<UpdateNotification />`.

**Q: Как обновить только для определенной платформы?**
A: Удалите другие платформы из записи в `releases.json`.

**Q: Нужен ли HTTPS для updater сервера?**
A: Рекомендуется, но не обязательно. Подписи защищают от подмены файлов.

---

## 🛠️ Troubleshooting

### Ошибка "Invalid signature"
- Проверьте что публичный ключ в `tauri.conf.json` совпадает с приватным ключом
- Убедитесь что файл был подписан правильным ключом

### Обновление не появляется
- Проверьте endpoint в `tauri.conf.json`
- Убедитесь что версия в `releases.json` выше текущей
- Проверьте логи updater сервера

### Ошибка загрузки
- Убедитесь что файлы доступны по указанным URL
- Проверьте права доступа к файлам
- Проверьте CORS настройки

---

## 📝 Roadmap

- [ ] Dashboard для управления релизами
- [ ] Поддержка beta/alpha каналов
- [ ] Rollback функциональность
- [ ] A/B тестирование обновлений
- [ ] Статистика установок

