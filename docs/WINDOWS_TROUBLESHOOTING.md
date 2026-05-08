# Решение проблем с Windows версией

## Проблема: Приложение не запускается

### Причина 1: Отсутствует WebView2

Tauri использует **Microsoft Edge WebView2** для отображения интерфейса. На новых версиях Windows 11 он обычно предустановлен, но на Windows 10 может отсутствовать.

#### Решение
**Теперь установщик автоматически загружает WebView2!**

С версии 0.3.1+ установщик включает `downloadBootstrapper` - он автоматически скачивает и устанавливает WebView2 если его нет.

Если все равно не работает, скачайте вручную:
1. Перейдите на https://developer.microsoft.com/en-us/microsoft-edge/webview2/
2. Скачайте **Evergreen Bootstrapper**
3. Установите перед запуском Вече

### Причина 2: Антивирус блокирует

Windows Defender или другой антивирус может блокировать неподписанное приложение.

#### Решение
1. Откройте **Windows Security** → **Virus & threat protection**
2. Перейдите в **Protection history**
3. Найдите блокировку `veche.exe` или `veche_*.exe`
4. Разрешите запуск через **Actions** → **Allow**

**Или добавьте в исключения:**
1. **Windows Security** → **Virus & threat protection**
2. **Manage settings** → **Exclusions**
3. **Add exclusion** → **Folder**
4. Выберите папку установки (обычно `C:\Program Files\veche\`)

### Причина 3: Отсутствуют Visual C++ библиотеки

Редко, но может не хватать Visual C++ Runtime.

#### Решение
Скачайте и установите:
- **Visual C++ Redistributable** (x64): https://aka.ms/vs/17/release/vc_redist.x64.exe

### Причина 4: Проблемы с правами доступа

Если установщик запущен без прав администратора.

#### Решение
1. Правый клик на `veche_*_x64-setup.exe`
2. **Запуск от имени администратора**
3. Разрешите изменения при UAC запросе

## Как проверить что именно не работает

### Проверка через Event Viewer
1. Нажмите `Win + X` → **Event Viewer**
2. Откройте **Windows Logs** → **Application**
3. Найдите ошибки связанные с `veche` или `webview2`
4. Посмотрите детали ошибки

### Проверка через командную строку
```cmd
# Перейдите в папку установки
cd "C:\Program Files\veche"

# Запустите напрямую чтобы увидеть ошибки
veche.exe
```

Ошибки появятся в консоли и помогут понять проблему.

## Конфигурация установщика (для разработчиков)

### Текущие настройки NSIS
```json
{
  "windows": {
    "webviewInstallMode": {
      "type": "downloadBootstrapper"  // Автоматически скачивает WebView2
    },
    "nsis": {
      "installerIcon": "icons/icon.ico",
      "installMode": "perMachine",      // Установка для всех пользователей
      "languages": ["Russian", "English"],
      "displayLanguageSelector": true
    }
  }
}
```

### Типы webviewInstallMode

| Режим | Описание | Размер установщика |
|-------|----------|-------------------|
| `downloadBootstrapper` | Скачивает WebView2 при установке | ~2-5 MB |
| `embedBootstrapper` | Включает bootstrapper в installer | ~2-5 MB |
| `offlineInstaller` | Включает полный WebView2 (~100MB) | ~100 MB |
| `fixedRuntime` | Использует встроенный runtime | ~130 MB |
| `skip` | Пропускает установку (не рекомендуется) | <1 MB |

**Текущий выбор**: `downloadBootstrapper` - оптимальный баланс размера и надежности.

## Альтернативное решение: Portable версия

Если установщик не работает, можно создать portable версию:

```bash
# Локально соберите без installer
npm run tauri build -- --bundles none

# Скопируйте из target/release:
# - veche.exe
# - Все .dll файлы
# - resources/ папку

# Упакуйте в ZIP
```

**Примечание**: Portable версия требует ручной установки WebView2.

## Проверка успешной установки

После установки проверьте:

1. **Приложение в меню Пуск**: Должно появиться "Вече"
2. **Файлы в Program Files**: `C:\Program Files\veche\veche.exe`
3. **WebView2 установлен**: 
   ```cmd
   reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
   ```
   Должен вернуть версию EdgeWebView

## Получение помощи

Если проблема не решается:

1. Соберите логи через Event Viewer (Application logs)
2. Попробуйте запустить через cmd чтобы увидеть ошибки
3. Проверьте версию Windows: `winver`
4. Проверьте наличие WebView2: откройте `edge://settings/help`

Создайте issue на GitHub с информацией:
- Версия Windows
- Текст ошибки (если есть)
- Логи из Event Viewer
- Скриншот проблемы

## Roadmap улучшений

- [ ] Код-подпись сертификатом (убирает предупреждения Windows)
- [ ] MSI installer вместо NSIS (альтернатива)
- [ ] Автоматические тесты на Windows в CI
- [ ] Portable версия в релизах
