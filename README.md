# KV Cache Manager Server Plugin

Серверный плагин для SillyTavern, который предоставляет API для управления файлами сохранений KV-кеша llama.cpp.

Этот плагин является серверной частью расширения [KV Cache Manager](https://github.com/fortrest-jr/kv_cache-manager) для SillyTavern.

## О расширении

Основное расширение [KV Cache Manager](https://github.com/fortrest-jr/kv_cache-manager) предоставляет функциональность для управления KV-кешем llama.cpp.

## Функциональность плагина

Серверный плагин предоставляет API эндпоинты для взаимодействия с файловой системой:
- Получения списка файлов сохранений
- Удаления указанных файлов

## Установка

1. Убедитесь, что в `config.yaml` SillyTavern установлено `enableServerPlugins: true`
2. Склонируйте репозиторий в директорию `plugins` вашей установки SillyTavern:
   ```bash
   cd plugins
   git clone https://github.com/fortrest-jr/kv_cache-manager-plugin
   ```
3. Установите зависимости:
   ```bash
   cd kv_cache-manager-plugin
   npm install
   ```
4. Соберите плагин:
   ```bash
   npm run build
   ```
5. Установите переменную окружения `KV_SAVE_DIR` с путем к директории, где хранятся файлы сохранений KV-кеша, используйте её же при запуске llama.cpp
6. Перезапустите сервер SillyTavern

## Настройка

Плагин требует установки переменной окружения `KV_SAVE_DIR`, которая указывает на директорию с файлами сохранений KV-кеша.

Пример:
```bash
export KV_SAVE_DIR="~/kv_caches"
```

## API Эндпоинты

Все эндпоинты доступны по пути `/api/plugins/kv_cache-manager/`

### GET `/files`

Получить список всех файлов в директории сохранений.

**Ответ:**
```json
{
  "files": [
    {
      "name": "chat_1234567890_slot0.bin",
      "size": 1024,
      "modified": "2025-01-15T10:30:00.000Z",
      "isDirectory": false
    }
  ]
}
```

### DELETE `/files/:filename`

Удалить указанный файл.

**Параметры:**
- `filename` - имя файла для удаления

**Ответ:**
```json
{
  "success": true,
  "message": "File chat_1234567890_slot0.bin deleted successfully"
}
```

**Ошибки:**
- `404` - файл не найден
- `403` - доступ запрещен
- `500` - внутренняя ошибка сервера

## Требования

- SillyTavern с поддержкой серверных плагинов
- Node.js
- Переменная окружения `KV_SAVE_DIR`

## Лицензия

MIT
