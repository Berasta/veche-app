# Оптимизация сборки Tauri

## Что уже сделано ✅

### GitHub Actions
- **Rust cache** (Swatinem/rust-cache@v2): кэширует зависимости и target директорию
- **Node cache**: кэширует node_modules через `cache: 'npm'`
- **Параллельная сборка**: matrix strategy для macOS, Linux, Windows

### Cargo.toml профили
- **release**: быстрая сборка с opt-level 2 (без LTO)
- **release-optimized**: финальные релизы с максимальной оптимизацией
- **dev**: инкрементальная компиляция

## Ожидаемые результаты

### С кэшированием
- **Первая сборка**: ~15-25 минут
- **Повторные сборки**: ~5-10 минут (экономия 50-70%)

### Без кэша
- **release профиль**: ~12-20 минут (вместо 20-30 минут с полной оптимизацией)

## Локальная разработка

### Быстрая dev сборка
```bash
npm run tauri dev
# Использует profile.dev с инкрементальной компиляцией
```

### Обычный релиз (быстрее)
```bash
npm run tauri build
# Использует profile.release (opt-level 2, без LTO)
```

### Финальный релиз (максимальная оптимизация)
```bash
cargo build --profile release-optimized --manifest-path src-tauri/Cargo.toml
# Использует profile.release-optimized (opt-level z, thin LTO)
```

## Дополнительные советы

### 1. Использование sccache (опционально)
Кэширует результаты компиляции между проектами:

```bash
# Установка
cargo install sccache

# В ~/.cargo/config.toml
[build]
rustc-wrapper = "sccache"
```

### 2. Параллельная компиляция
По умолчанию Cargo использует все CPU ядра. Можно ограничить для экономии памяти:

```bash
# В CI или на слабых машинах
cargo build -j 2
```

### 3. Отключение ненужных features
Проверьте зависимости в `Cargo.toml` - возможно какие-то features не используются:

```toml
# Вместо
tauri = "2.10.3"

# Используйте
tauri = { version = "2.10.3", features = ["tray-icon"], default-features = false }
```

### 4. Кэш локально (Linux/macOS)
```bash
# Очистить кэш если проблемы
cargo clean

# Использовать cargo-cache для управления
cargo install cargo-cache
cargo cache --info
```

## Мониторинг времени сборки

### GitHub Actions
Смотрите время каждого шага в логах workflow:
- "Rust cache": должен показывать cache hit
- "Build Tauri app": основное время сборки

### Локально
```bash
# С подробной статистикой
cargo build --timings
# Создаст HTML отчет в target/cargo-timings/
```

## Когда использовать какой профиль

| Сценарий | Профиль | Время | Размер | Производительность |
|----------|---------|-------|--------|-------------------|
| Dev сборка | dev | Быстро | Большой | Низкая |
| Тестовый релиз | release | Средне | Средний | Хорошая |
| Финальный релиз | release-optimized | Долго | Маленький | Отличная |
| CI/CD | release | Средне | Средний | Хорошая |

## Проблемы и решения

### Cache не работает в GitHub Actions
- Проверьте что Swatinem/rust-cache@v2 используется
- Убедитесь что workspaces указан правильно: `src-tauri`
- Cache автоматически инвалидируется при изменении Cargo.lock

### Сборка все еще долгая
- Проверьте количество зависимостей: `cargo tree`
- Рассмотрите использование cargo-chef для Docker сборок
- Используйте более мощные GitHub runners (платно)

### Out of memory в CI
- Уменьшите параллелизм: добавьте `CARGO_BUILD_JOBS=2` в env
- Используйте профиль с меньшей оптимизацией

## Ресурсы
- [Tauri Build Optimization](https://tauri.app/v1/guides/building/app-size)
- [Rust Profile Documentation](https://doc.rust-lang.org/cargo/reference/profiles.html)
- [Swatinem/rust-cache](https://github.com/Swatinem/rust-cache)
