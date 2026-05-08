# 📦 Миграция структуры проекта

## Изменения в структуре файлов

Проект был реорганизован для лучшей читаемости и поддержки.

### ✅ Что изменилось

#### Документация переехала в `docs/`
- `UPDATER_GUIDE.md` → `docs/UPDATER_GUIDE.md`
- `UPDATER_README.md` → `docs/UPDATER_README.md`

#### Серверные файлы переехали в `server/`
- `server.js` → `server/server.js`
- `updater-server.js` → `server/updater-server.js`

#### Скрипты переехали в `scripts/`
- `release.sh` → `scripts/release.sh`
- `setup-updater.sh` → `scripts/setup-updater.sh`
- `deploy-update.sh` → `scripts/deploy-update.sh`

#### Конфигурация переехала в `config/`
- `nginx.conf` → `config/nginx.conf`
- `nginx-updater.conf` → `config/nginx-updater.conf`

### 🔧 Обновленные команды

#### package.json
```json
{
  "scripts": {
    "updater": "node server/updater-server.js",  // было: node updater-server.js
    "release": "./scripts/release.sh"             // было: ./release.sh
  }
}
```

#### Docker файлы
- `Dockerfile.meta` теперь использует `server/server.js`
- `Dockerfile.updater` теперь использует `server/updater-server.js`
- `docker-compose.yml` обновлен для новых путей к nginx конфигам

### 📁 Новая структура

```
app/
├── docs/          # 📚 Вся документация
├── scripts/       # 🔧 Все скрипты автоматизации
├── server/        # 🖥️ Серверные приложения
├── config/        # ⚙️ Конфигурационные файлы
├── src/           # ⚛️ React исходники
├── src-tauri/     # 🦀 Rust backend
└── public/        # 🌐 Статические файлы
```

### 🚀 Действия после обновления

Все изменения уже применены автоматически. Никаких действий не требуется.

Можете продолжать работать как обычно:
```bash
npm run dev           # Разработка
npm run tauri dev     # Tauri приложение
npm run updater       # Updater сервер
./scripts/release.sh  # Создание релиза
```

### ℹ️ Старые пути больше не работают

Если у вас есть собственные скрипты или команды, обновите пути:
- `./release.sh` → `./scripts/release.sh`
- `node updater-server.js` → `node server/updater-server.js`
- и т.д.

---

*Эта миграция была выполнена автоматически для улучшения организации проекта.*
