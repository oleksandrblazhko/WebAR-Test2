# Google Cloud TTS - Генератор аудіо

Програма для створення справжніх MP3/WAV/OGG файлів з текстом за допомогою **Google Cloud Text-to-Speech API**.

## Можливості

- ✅ Генерація реальних аудіофайлів (MP3, WAV, OGG)
- ✅ Вибір з сотень голосів Google
- ✅ Налаштування швидкості та тону
- ✅ Підтримка багатьох мов (португальська, іспанська, англійська, українська)
- ✅ Попередній перегляд аудіо
- ✅ Масове завантаження у ZIP
- ✅ Індивідуальне завантаження кожного файлу

## Встановлення та налаштування

### Крок 1: Отримання API ключа

1. Відкрийте [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Увімкніть **Cloud Text-to-Speech API**:
   - Меню → APIs & Services → Library
   - Пошук "Cloud Text-to-Speech API"
   - Натисніть "Enable"
4. Створіть облікові дані:
   - APIs & Services → Credentials
   - Create Credentials → API Key
5. Скопіюйте API ключ

### Крок 2: Використання програми

1. Відкрийте `google-tts.html` у браузері
2. Вставте API ключ у поле "API Key"
3. Натисніть "🔄 Завантажити голоси"
4. Виберіть мову та голос
5. Введіть слова у текстове поле
6. Натисніть "🎵 Створити аудіо"
7. Завантажте результат (ZIP або окремі файли)

## Налаштування

| Параметр | Опис | Діапазон |
|----------|------|----------|
| **Мова** | Мова синтезу | pt-PT, pt-BR, es-ES, en-US, uk-UA, тощо |
| **Голос** | Конкретний голос (чоловічий/жіночий) | Залежить від мови |
| **Швидкість** | Швидкість вимови | 0.25 - 4.0 |
| **Тон** | Висота голосу | -20.0 - 20.0 |
| **Формат** | Аудіоформат | MP3, WAV (LINEAR16), OGG Opus |

## Доступні голоси

### Португальська (pt-PT):
- pt-PT-Standard-A (♀)
- pt-PT-Standard-B (♂)
- pt-PT-Wavenet-A (♀)
- pt-PT-Wavenet-B (♂)
- pt-PT-Neural2-A (♀)
- pt-PT-Neural2-B (♂)

### Португальська (pt-BR):
- pt-BR-Standard-A (♀)
- pt-BR-Standard-B (♂)
- pt-BR-Wavenet-A (♀)
- pt-BR-Wavenet-B (♂)
- pt-BR-Neural2-A (♀)
- pt-BR-Neural2-B (♂)

### Іспанська (es-ES):
- es-ES-Standard-A (♀)
- es-ES-Standard-B (♂)
- es-ES-Wavenet-A (♀)
- es-ES-Wavenet-B (♂)
- es-ES-Neural2-A (♀)
- es-ES-Neural2-B (♂)

### Українська (uk-UA):
- uk-UA-Wavenet-A (♀)

## Вартість

Google Cloud TTS має **безкоштовний ліміт**:
- **4 мільйони символів/місяць** (Standard голоси)
- **1 мільйон символів/місяць** (WaveNet, Neural2 голоси)

Після перевищення — $4-$16 за 1 мільйон символів.

## Приклад вихідних файлів

```
text-audio-mp3.zip
├── audio/
│   ├── Realidade.mp3
│   ├── Palavra.mp3
│   ├── Livro.mp3
│   └── ...
├── settings.json
└── words.txt
```

## Посилання

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Доступні голоси](https://cloud.google.com/text-to-speech/docs/voices)
- [Ціни](https://cloud.google.com/text-to-speech/pricing)
