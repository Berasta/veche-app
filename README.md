# Вече — Древнерусскiй голосовой мессенджеръ

Современный голосовой мессенджер с древнерусским колоритом, построенный на Tauri, React и LiveKit.

## 📁 Структура проекта

```
app/
├── src/                    # Исходный код React приложения
│   ├── app/               # Конфигурация приложения (store, layout)
│   ├── entities/          # Бизнес-сущности (channel, member, message, etc.)
│   ├── features/          # Фичи (auth, voice, invite, etc.)
│   ├── pages/             # Страницы приложения
│   ├── router/            # Роутинг
│   ├── shared/            # Общие компоненты и утилиты
│   └── styles/            # Глобальные стили
│
├── src-tauri/             # Tauri (Rust) backend
│   ├── src/               # Rust код
│   ├── Cargo.toml         # Зависимости Rust
│   └── tauri.conf.json    # Конфигурация Tauri
│
├── server/                # Серверные приложения
│   ├── server.js          # OG image сервер (meta теги)
│   └── updater-server.js  # Сервер автообновлений для Tauri
│
├── scripts/               # Скрипты автоматизации
│   ├── release.sh         # Создание релиза и подпись бинарников
│   ├── setup-updater.sh   # Настройка системы обновлений
│   └── deploy-update.sh   # Деплой обновлений
│
├── config/                # Конфигурационные файлы
│   ├── nginx.conf         # Nginx конфиг для основного приложения
│   └── nginx-updater.conf # Nginx конфиг для updater сервера
│
├── docs/                  # Документация
│   ├── UPDATER_GUIDE.md   # Полное руководство по системе обновлений
│   └── UPDATER_README.md  # Краткое описание обновлений
│
├── public/                # Статические файлы
├── dist/                  # Собранное приложение
│
├── Dockerfile             # Docker образ для веб-версии
├── Dockerfile.meta        # Docker образ для meta сервера
├── Dockerfile.updater     # Docker образ для updater сервера
├── docker-compose.yml     # Оркестрация всех сервисов
│
├── package.json           # NPM зависимости и скрипты
├── vite.config.ts         # Конфигурация Vite
└── tsconfig.json          # Конфигурация TypeScript
```

## 🚀 Быстрый старт

### Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера (веб)
npm run dev

# Запуск Tauri приложения (desktop)
npm run tauri dev

# Запуск updater сервера
npm run updater
```

### Сборка

```bash
# Сборка веб-версии
npm run build

# Сборка Tauri приложения
npm run tauri build

# Создание релиза с автообновлениями (локально)
./scripts/release.sh 0.3.1
```

### 🏷️ Создание релиза через GitHub Actions

**Рекомендуемый способ:**
1. Откройте [GitHub Actions](https://github.com/YOUR_USERNAME/veche/actions)
2. Выберите **"Tauri Release"**
3. Нажмите **"Run workflow"**
4. Укажите версию (например: `0.3.1`) и запустите

**Через git tag:**
```bash
git tag v0.3.1
git push origin v0.3.1
```

📚 [Подробная инструкция по релизам](docs/RELEASE_GUIDE.md)

### Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Только основное приложение
docker-compose up app

# Только updater сервер
docker-compose up updater
```

## 🔧 Основные скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск Vite dev сервера |
| `npm run build` | Сборка production build |
| `npm run tauri dev` | Запуск Tauri в dev режиме |
| `npm run tauri build` | Сборка Tauri приложения |
| `npm run updater` | Запуск updater сервера |
| `./scripts/release.sh <version>` | Создание релиза |
| `./scripts/setup-updater.sh` | Настройка ключей для обновлений |

## 📚 Документация

- [Руководство по созданию релизов](docs/RELEASE_GUIDE.md) - Как создавать релизы через GitHub Actions
- [Руководство по автообновлениям](docs/UPDATER_GUIDE.md) - Полное руководство по системе обновлений
- [Атрибуции](ATTRIBUTIONS.md) - Лицензии и авторские права

## 🏗️ Технологический стек

- **Frontend**: React 18, Redux Toolkit, React Router v7
- **Desktop**: Tauri v2 (Rust + WebView)
- **Voice/Video**: LiveKit
- **Backend**: PocketBase
- **Styling**: Tailwind CSS, Radix UI
- **Build**: Vite
- **Deployment**: Docker, Kubernetes (k3s)

## 🔐 Настройка автообновлений

```bash
# 1. Генерация ключей для подписи
./scripts/setup-updater.sh

# 2. Создание первого релиза
./scripts/release.sh 0.3.0

# 3. Запуск updater сервера
npm run updater
```

Подробности в [docs/UPDATER_GUIDE.md](docs/UPDATER_GUIDE.md)

## 📝 Переменные окружения

```bash
# .env
VITE_PB_URL=https://admin.weche.ru  # URL PocketBase API
APP_URL=https://weche.ru             # URL основного приложения
UPDATER_PORT=3002                    # Порт updater сервера
```

## 🤝 Вклад в проект

Pull requests приветствуются! Для крупных изменений сначала откройте issue для обсуждения.

## 📄 Лицензия

См. [ATTRIBUTIONS.md](ATTRIBUTIONS.md)
