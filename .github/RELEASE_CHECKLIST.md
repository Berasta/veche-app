# ✅ Release Checklist

## Перед созданием релиза

- [ ] Все изменения закоммичены и запушены
- [ ] Протестированы основные функции
- [ ] Обновлен CHANGELOG.md (если есть)
- [ ] Проверены зависимости (нет критических уязвимостей)

## Создание релиза

### Вариант A: Через GitHub UI (рекомендуется)

1. Откройте https://github.com/YOUR_USERNAME/veche/actions
2. Выберите workflow **"Tauri Release"**
3. Нажмите **"Run workflow"**
4. Заполните:
   - Version: `0.3.1` (без 'v')
   - Draft: ✅ (если хотите редактировать описание)
   - Prerelease: ☐ (только для бета-версий)
5. Нажмите **"Run workflow"**

### Вариант B: Через git tag

```bash
git tag v0.3.1
git push origin v0.3.1
```

## После создания релиза

- [ ] Workflow успешно завершился
- [ ] Все артефакты загрузились в GitHub Release
- [ ] `releases.json` обновился на updater сервере
- [ ] Протестировать установку на чистой системе:
  - [ ] macOS (Intel)
  - [ ] macOS (Apple Silicon)
  - [ ] Windows
  - [ ] Linux
- [ ] Протестировать автообновление с предыдущей версии
- [ ] Если релиз был Draft - опубликовать
- [ ] Анонсировать релиз (если нужно)

## Проверки

```bash
# Проверить releases.json
curl https://updates.weche.ru/releases.json

# Проверить конкретный эндпоинт
curl https://updates.weche.ru/updates/darwin-aarch64/0.3.0

# Проверить GitHub Release
open https://github.com/YOUR_USERNAME/veche/releases/tag/v0.3.1
```

## В случае проблем

### Релиз провалился
1. Проверьте логи в Actions
2. Исправьте проблему
3. Удалите тег: `git tag -d v0.3.1 && git push origin :v0.3.1`
4. Попробуйте снова

### Нужно откатить релиз
1. Удалите Release на GitHub
2. Удалите тег: `git tag -d v0.3.1 && git push origin :v0.3.1`
3. На сервере удалите файлы из `/var/www/updates/releases/`
4. Восстановите предыдущую версию в `releases.json`

## 🔑 Первый релиз?

Если это первый релиз, сначала настройте:

```bash
# 1. Генерация ключей для подписи
./scripts/setup-updater.sh

# 2. Добавьте GitHub Secrets
# Repository → Settings → Secrets → Actions
# - TAURI_SIGNING_PRIVATE_KEY (содержимое ~/.tauri/veche.key)
# - TAURI_SIGNING_PRIVATE_KEY_PASSWORD (ваш пароль)
# - DEPLOY_SSH_KEY, DEPLOY_HOST, DEPLOY_USER (для деплоя)

# 3. Обновите публичный ключ в tauri.conf.json
cat ~/.tauri/veche.key.pub
# Вставьте в src-tauri/tauri.conf.json → updater → pubkey
```

---

📚 **Подробнее:** [docs/RELEASE_GUIDE.md](../docs/RELEASE_GUIDE.md)
