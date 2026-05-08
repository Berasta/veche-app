# 🚀 Создание релизов Tauri приложения

Руководство по созданию релизов для desktop версии Вече.

## 📋 Два способа создания релизов

### 1. 🏷️ Через Git теги (автоматический)

Создайте и запуште тег - релиз будет создан автоматически:

```bash
# 1. Убедитесь что все изменения закоммичены
git status

# 2. Создайте тег
git tag v0.3.1

# 3. Запуште тег
git push origin v0.3.1
```

**Что произойдет:**
- ✅ Соберутся бинарники для macOS (Intel + Apple Silicon), Windows, Linux
- ✅ Все файлы будут подписаны вашим ключом
- ✅ Создастся GitHub Release с артефактами
- ✅ Сгенерируется `releases.json` для автообновлений
- ✅ Все загрузится на updater сервер
- ✅ Соберется и задеплоится веб-версия

**Workflow:** `.github/workflows/release.yml`

---

### 2. 🎯 Через GitHub UI (ручной запуск)

Используйте для быстрых релизов или тестирования:

1. Откройте https://github.com/your-username/veche/actions
2. Выберите workflow **"Tauri Release"**
3. Нажмите **"Run workflow"**
4. Заполните параметры:
   - **Version**: `0.3.1` (без 'v')
   - **Draft**: создать как черновик (можно редактировать перед публикацией)
   - **Prerelease**: пометить как pre-release (бета-версия)
5. Нажмите **"Run workflow"**

**Преимущества:**
- 🎨 Можно редактировать описание релиза перед публикацией (draft)
- 🧪 Можно помечать как pre-release для бета-тестирования
- ⚡ Быстрее чем локальная сборка
- 🌐 Не собирает веб-версию (только desktop)

**Workflow:** `.github/workflows/tauri-release.yml`

---

## 🔧 Локальная сборка (для тестирования)

Используйте скрипт для локального тестирования перед релизом:

```bash
# Установка зависимостей (только при первом запуске)
./scripts/setup-updater.sh

# Создание релиза локально
./scripts/release.sh 0.3.1
```

**Что создастся:**
```
updates/
├── releases.json           # Метаданные для автообновлений
└── releases/
    ├── veche_0.3.1_aarch64.dmg
    ├── veche_0.3.1_aarch64.dmg.sig
    ├── veche_0.3.1_x64.dmg
    ├── veche_0.3.1_x64.dmg.sig
    ├── veche_0.3.1_x64_en-US.msi
    ├── veche_0.3.1_x64_en-US.msi.sig
    └── ...
```

**Тестирование updater сервера:**
```bash
# Запустите локальный updater server
npm run updater

# В другом терминале проверьте
curl http://localhost:3002/releases.json
```

---

## 📝 Требования

### GitHub Secrets

Настройте следующие секреты в GitHub: Settings → Secrets → Actions

| Secret | Описание | Как получить |
|--------|----------|--------------|
| `TAURI_SIGNING_PRIVATE_KEY` | Приватный ключ для подписи | `./scripts/setup-updater.sh` создаст ключ в `~/.tauri/veche.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Пароль от ключа | Тот что вы указали при генерации |
| `DEPLOY_SSH_KEY` | SSH ключ для деплоя | `cat ~/.ssh/id_rsa` |
| `DEPLOY_HOST` | Адрес сервера | `77.232.138.25` |
| `DEPLOY_USER` | Пользователь для SSH | `root` или ваш user |
| `VITE_PB_URL` | URL PocketBase API | `https://admin.weche.ru` |

### Настройка ключей подписи

```bash
# 1. Сгенерируйте ключи
./scripts/setup-updater.sh

# 2. Скопируйте приватный ключ
cat ~/.tauri/veche.key

# 3. Добавьте в GitHub Secrets как TAURI_SIGNING_PRIVATE_KEY

# 4. Скопируйте публичный ключ в tauri.conf.json
cat ~/.tauri/veche.key.pub
# Вставьте в src-tauri/tauri.conf.json → updater → pubkey
```

---

## 🎨 Кастомизация описания релиза

### Вариант 1: Редактируйте после создания

1. Создайте релиз как **Draft**
2. Отредактируйте описание на GitHub
3. Опубликуйте

### Вариант 2: Используйте CHANGELOG.md

Создайте файл `CHANGELOG.md` в корне проекта:

```markdown
# Changelog

## [0.3.1] - 2026-05-08

### ✨ Новые возможности
- Добавлена система автообновлений
- Горячие клавиши для голосового чата
- Push-to-Talk и Push-to-Mute режимы

### 🐛 Исправления
- Исправлена проблема с VPN
- Улучшена производительность голосового чата

### 🔧 Улучшения
- Обновлены зависимости
- Улучшен UI настроек
```

Workflow автоматически добавит ссылку на CHANGELOG.md.

---

## 🔄 Процесс автообновления

### Как это работает

1. **Пользователь открывает приложение**
2. `useAppUpdater` проверяет `https://updates.weche.ru/updates/:platform/:version`
3. Если доступна новая версия - показывается уведомление
4. При нажатии "Обновить" - скачивается и устанавливается новая версия
5. Приложение перезапускается

### Тестирование автообновления

```bash
# 1. Создайте релиз версии 0.3.1
./scripts/release.sh 0.3.1

# 2. Запустите updater server
npm run updater

# 3. В tauri.conf.json временно измените updater endpoint
{
  "updater": {
    "endpoints": ["http://localhost:3002/updates/{{target}}/{{current_version}}"]
  }
}

# 4. Соберите приложение с версией 0.3.0
# (в tauri.conf.json измените version на "0.3.0")
npm run tauri build

# 5. Запустите собранное приложение
# Оно должно обнаружить обновление до 0.3.1
```

---

## 📊 Мониторинг релизов

### Проверка статуса workflow

1. https://github.com/your-username/veche/actions
2. Найдите ваш workflow run
3. Проверьте логи каждого шага

### Проверка артефактов

```bash
# GitHub Release
https://github.com/your-username/veche/releases/tag/v0.3.1

# Updater server
curl https://updates.weche.ru/releases.json

# Конкретный эндпоинт
curl https://updates.weche.ru/updates/darwin-aarch64/0.3.0
```

---

## ❓ Troubleshooting

### ❌ "Failed to sign artifact"

**Проблема:** Не настроены секреты для подписи

**Решение:**
```bash
# Сгенерируйте ключи
./scripts/setup-updater.sh

# Добавьте в GitHub Secrets
TAURI_SIGNING_PRIVATE_KEY = содержимое ~/.tauri/veche.key
TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ваш пароль
```

---

### ❌ "releases.json not found"

**Проблема:** Updater server не может найти releases.json

**Решение:**
```bash
# На сервере проверьте структуру
ssh user@server
ls -la /var/www/updates/
# Должно быть:
# /var/www/updates/releases.json
# /var/www/updates/releases/*.dmg

# Проверьте права доступа
chmod -R 755 /var/www/updates/
```

---

### ❌ Build failed на macOS

**Проблема:** Не установлен Xcode Command Line Tools

**Решение:**
```bash
xcode-select --install
```

---

### ❌ Deploy to server failed

**Проблема:** SSH ключ не работает

**Решение:**
```bash
# Проверьте SSH доступ локально
ssh -i ~/.ssh/id_rsa user@server

# Проверьте формат ключа в GitHub Secret
# Должен быть полный ключ включая:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----

# Убедитесь что на сервере настроен authorized_keys
cat ~/.ssh/authorized_keys
```

---

## 📚 Дополнительные ресурсы

- [Tauri Updater Guide](https://tauri.app/v1/guides/distribution/updater)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Signing Guide](https://tauri.app/v1/guides/distribution/sign)

---

## 🎯 Checklist релиза

Перед созданием релиза:

- [ ] Все изменения закоммичены
- [ ] Версия обновлена в `package.json` (опционально, workflow обновит)
- [ ] Версия обновлена в `src-tauri/tauri.conf.json` (опционально)
- [ ] Протестированы основные функции
- [ ] Написан CHANGELOG для версии
- [ ] Настроены GitHub Secrets
- [ ] Updater server работает

После создания релиза:

- [ ] Проверить что все артефакты загрузились в GitHub Release
- [ ] Проверить `releases.json` на updater сервере
- [ ] Протестировать автообновление с предыдущей версии
- [ ] Проверить установку на чистой системе
- [ ] Анонсировать релиз пользователям

---

**Удачных релизов! 🚀**
