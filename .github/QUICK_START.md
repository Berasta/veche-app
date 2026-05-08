# 🚀 Быстрые команды для релизов

## Создать релиз

### 🎯 Рекомендуемый способ (GitHub UI)
1. https://github.com/YOUR_USERNAME/veche/actions
2. **Tauri Release** → Run workflow
3. Version: `0.3.1` → Run

### ⚡ Через git tag
```bash
git tag v0.3.1 && git push origin v0.3.1
```

### 💻 Локально (для тестирования)
```bash
./scripts/release.sh 0.3.1
```

---

## Первая настройка

```bash
# Генерация ключей подписи
./scripts/setup-updater.sh

# Добавьте в GitHub Secrets:
cat ~/.tauri/veche.key  # → TAURI_SIGNING_PRIVATE_KEY
# Ваш пароль → TAURI_SIGNING_PRIVATE_KEY_PASSWORD
```

---

## Проверки

```bash
# releases.json
curl https://updates.weche.ru/releases.json

# Конкретная платформа
curl https://updates.weche.ru/updates/darwin-aarch64/0.3.0

# Локальный тест updater
npm run updater
curl http://localhost:3002/releases.json
```

---

## Откат релиза

```bash
# Удалить тег
git tag -d v0.3.1
git push origin :v0.3.1

# + удалить Release на GitHub вручную
```

---

📚 **Подробнее:** [docs/RELEASE_GUIDE.md](../../docs/RELEASE_GUIDE.md)
