# GitHub Actions Workflows

## 🎯 Доступные workflows

### 1. **Tauri Release** (`tauri-release.yml`)
**Использовать для:** Создания релизов desktop приложения

**Когда запускается:**
- Вручную через GitHub UI (Actions → Tauri Release → Run workflow)

**Что делает:**
- ✅ Собирает бинарники для macOS (Intel + Apple Silicon), Windows, Linux
- ✅ Подписывает все артефакты
- ✅ Создает GitHub Release
- ✅ Генерирует `releases.json` для автообновлений
- ✅ Загружает на updater server

**Параметры:**
- `version` - версия релиза (например: `0.3.1`)
- `draft` - создать как черновик (можно редактировать перед публикацией)
- `prerelease` - пометить как pre-release (бета)

**Пример использования:**
1. Actions → Tauri Release → Run workflow
2. Version: `0.3.1`
3. Draft: ✅ (если хотите отредактировать описание)
4. Run workflow

---

### 2. **Build and Release** (`release.yml`)
**Использовать для:** Полного релиза (desktop + веб)

**Когда запускается:**
- Автоматически при пуше git тега `v*.*.*`
- Вручную через GitHub UI

**Что делает:**
- ✅ Все что делает Tauri Release
- ✅ **Дополнительно:** собирает и деплоит веб-версию

**Пример использования:**
```bash
git tag v0.3.1
git push origin v0.3.1
```

---

### 3. **Tauri Build** (`tauri-build.yml`)
**Использовать для:** Тестовых сборок без релиза

**Когда запускается:**
- Автоматически при push в main/develop
- При создании Pull Request

**Что делает:**
- ✅ Собирает бинарники
- ✅ Запускает тесты
- ❌ НЕ создает релиз
- ❌ НЕ загружает на сервер

---

### 4. **Docker Build** (`docker-build.yml`)
**Использовать для:** Сборки Docker образов для веб-версии

**Когда запускается:**
- При push в main
- При изменении Dockerfile

**Что делает:**
- ✅ Собирает Docker образы (app, meta, updater)
- ✅ Пушит в registry
- ✅ Деплоит на продакшн сервер

---

## 🚀 Быстрый старт

### Создать релиз desktop приложения

**Способ 1: Через UI (рекомендуется)**
1. https://github.com/your-username/veche/actions
2. Tauri Release → Run workflow
3. Укажите версию: `0.3.1`
4. Run

**Способ 2: Через git tag**
```bash
git tag v0.3.1
git push origin v0.3.1
```

### Создать тестовую сборку

Просто сделайте push в main - автоматически запустится Tauri Build

---

## ⚙️ Требуемые GitHub Secrets

Настройте в: Repository → Settings → Secrets → Actions

| Secret | Нужен для | Описание |
|--------|-----------|----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Все релизы | Приватный ключ для подписи бинарников |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Все релизы | Пароль от ключа |
| `DEPLOY_SSH_KEY` | Деплой | SSH ключ для доступа к серверу |
| `DEPLOY_HOST` | Деплой | IP или домен сервера |
| `DEPLOY_USER` | Деплой | Пользователь для SSH |
| `VITE_PB_URL` | Сборка | URL PocketBase API |

**Как получить ключи подписи:**
```bash
./scripts/setup-updater.sh
cat ~/.tauri/veche.key  # Это TAURI_SIGNING_PRIVATE_KEY
```

---

## 📊 Мониторинг

### Проверить статус workflow
https://github.com/your-username/veche/actions

### Проверить созданный релиз
https://github.com/your-username/veche/releases

### Проверить updater endpoint
```bash
curl https://updates.weche.ru/releases.json
```

---

## ❓ FAQ

**Q: Какой workflow использовать для обычного релиза?**  
A: `Tauri Release` - запускайте вручную через GitHub UI

**Q: Как создать бета-версию?**  
A: `Tauri Release` с параметром `prerelease: true`

**Q: Как отредактировать описание релиза перед публикацией?**  
A: `Tauri Release` с параметром `draft: true`, затем отредактируйте на GitHub и опубликуйте

**Q: Нужно ли создавать релиз для каждого коммита?**  
A: Нет, тестовые сборки создаются автоматически в `Tauri Build`

**Q: Можно ли откатить релиз?**  
A: Да, удалите release на GitHub и tag: `git tag -d v0.3.1 && git push origin :v0.3.1`

---

## 🔗 Полезные ссылки

- [Подробное руководство по релизам](../docs/RELEASE_GUIDE.md)
- [Настройка автообновлений](../docs/UPDATER_GUIDE.md)
- [Tauri Actions Documentation](https://github.com/tauri-apps/tauri-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
