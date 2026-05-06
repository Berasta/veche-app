# LiveKit Webhook Debugger

Простое Go-приложение для отладки вебхуков LiveKit.

## Запуск

```bash
cd lk-webhook-debug
LIVEKIT_API_KEY="ваш-ключ" LIVEKIT_API_SECRET="ваш-секрет" ./lk-debug
```

По умолчанию слушает на порту `8080`. Можно изменить через `PORT`.

## Использование

1. Запустите приложение
2. В настройках LiveKit укажите URL вебхука: `http://<ваш-ip>:8080/webhook`
3. В консоли будут отображаться все входящие вебхуки

## Проверка вручную

```bash
curl -X POST http://localhost:8080/webhook \
  -H "Content-Type: application/webhook+json" \
  -H "Authorization: Bearer <livekit-jwt>" \
  -d '{"event":"participant_joined","room":{"name":"test"},"participant":{"identity":"user1"}}'
```
