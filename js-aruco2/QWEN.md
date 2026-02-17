# js-aruco2 - Контекст проєкту

## Огляд проєкту

**js-aruco2** — це бібліотека JavaScript для виявлення маркерів ArUco (квадратних фідуціальних маркерів) на зображеннях та у відеопотоках. Це форк бібліотеки [js-aruco](https://github.com/jcmellado/js-aruco) з додатковою підтримкою:

- Словника **ARUCO_MIP_36h12** (на додачу до оригінального словника ARUCO)
- Користувацьких словників ArUco (AprilTag, ARTag, ARToolkitPlus, ChiliTags тощо)
- Інтеграції з **Node.js** для серверного виявлення маркерів у відеопотоках FFMPEG
- **Генерації маркерів у форматі SVG** для створення маркерів для друку

Бібліотека базується на оригінальній бібліотеці [ArUco](https://www.uco.es/investiga/grupos/ava/portfolio/aruco/) для застосунків доповненої реальності та реалізована на чистому JavaScript без зовнішніх залежностей.

## Архітектура

### Основні вихідні файли (`src/`)

| Файл | Опис |
|------|------|
| `aruco.js` | Головний файл. Містить `AR.Detector`, `AR.Dictionary` та визначення словників |
| `cv.js` | Утиліти комп'ютерного зору (конвертація у відтінки сірого, бінаризація, виявлення контурів тощо) |
| `posit1.js` | Алгоритм POSIT для оцінки 3D-пози (копланарні точки) |
| `posit2.js` | Альтернативна реалізація POSIT |
| `svd.js` | Утиліта сингулярного розкладу (SVD) для розрахунків пози |
| `dictionaries/` | Додаткові визначення словників (варіанти AprilTag, ARTag тощо) |

### Ключові класи

- **`AR.Detector`** — Головний клас виявлення. Обробляє виявлення маркерів на зображеннях/відеопотоках
- **`AR.Dictionary`** — Керує визначеннями кодів маркерів для конкретного словника
- **`AR.Marker`** — Представляє виявлений маркер з властивостями `id` та `corners`
- **`POS.Posit`** — Оцінка 3D-пози за кутовими точками маркера
- **`POS.Pose`** — Містить результати: матрицю обертання та вектор переміщення

### Підтримувані словники

Вбудовані словники:
- `ARUCO` — маркери 7×7, 25 біт, 1023 коди, мін. відстань Геммінга = 3
- `ARUCO_MIP_36h12` — маркери 8×8, 36 біт, 250 кодів, мін. відстань Геммінга = 12

Додаткові словники доступні у `src/dictionaries/`:
- Варіанти AprilTag (16h5, 25h7, 25h9, 36h9, 36h10, 36h11)
- ARTag, ARToolkitPlus, ARToolkitPlus BCH
- Варіанти ArUco (4×4, 5×5, 6×6, 7×7, варіанти MIP)
- Chilitags

## Збирання та запуск

### Встановлення

```bash
npm install
```

### Використання у браузері

```javascript
// Створити детектор зі словником за замовчуванням (ARUCO_MIP_36h12)
var detector = new AR.Detector();

// Або вказати словник
var detector = new AR.Detector({
  dictionaryName: 'ARUCO',
  maxHammingDistance: 5
});

// Виявити маркери на ImageData canvas
var markers = detector.detect(imageData);

// markers — це масив об'єктів AR.Marker:
// - markers[i].id: ID маркера
// - markers[i].corners: [{x, y}, {x, y}, {x, y}, {x, y}]
```

### Використання в Node.js

Див. `samples/node-js-server/` для повного прикладу серверного виявлення з використанням потоків FFMPEG.

```bash
cd samples/node-js-server
npm run init      # Ініціалізувати проєкт
npm run server    # Запустити сервер виявлення
npm run stream_win  # Запустити потік FFMPEG (Windows)
```

### Оцінка 3D-пози

```javascript
var posit = new POS.Posit(modelSize, focalLength);
var pose = posit.pose(corners);

// pose містить:
// - bestRotation: матриця обертання 3×3
// - bestTranslation: [x, y, z]
// - bestError: похибка оцінки
// - alternativeRotation/Translation/Error: альтернативне рішення
```

### Генерація маркерів у SVG

```javascript
var dictionary = new AR.Dictionary('ARUCO');
var svg = dictionary.generateSVG(markerId);
```

## Практики розробки

### Стиль коду

- Використовує **var** для оголошення змінних (стиль ES5)
- Глобальні простори імен: `AR`, `CV`, `POS`, `SVD`
- Відсутня система модулів — використовується патерн `require()` для сумісності з Node.js
- Заголовки ліцензії MIT/BSD на початку кожного файлу

### Тестування

Формальний набір тестів відсутній. Тестування виконується через зразки застосунків:

| Зразок | Опис |
|--------|------|
| `samples/getusermedia/` | Виявлення маркерів через вебкамеру у браузері |
| `samples/debug/` | Візуальне налагодження з накладанням |
| `samples/debug-posit/` | Демонстрація оцінки 3D-пози |
| `samples/marker-creator/` | Інтерфейс генератора маркерів SVG |
| `samples/node-js-server/` | Інтеграція з Node.js + FFMPEG |

### Додавання користувацьких словників

```javascript
AR.DICTIONARIES.MyDictionary = {
  nBits: 25,
  tau: 3,  // опціонально: відстань Геммінга
  codeList: ['0x1084210UL', '0x1084217UL', ...]
};

var detector = new AR.Detector({
  dictionaryName: 'MyDictionary'
});
```

## Ключові параметри конфігурації

### Опції детектора

```javascript
new AR.Detector({
  dictionaryName: 'ARUCO_MIP_36h12',  // Словник для використання
  maxHammingDistance: 5               // Допустима похибка (опціонально)
});
```

### Формати даних зображення

Метод `detect()` приймає:
1. **Canvas ImageData**: `detector.detect(imageData)`
2. **Raw RGBA**: `detector.detect(width, height, data)`, де data — Uint8ClampedArray

### Виявлення у відеопотоці

```javascript
// Ініціалізація обробки потоку
detector.detectStreamInit(width, height, callback);

// Обробка відео-чанків (викликати для кожного чанку)
detector.detectStream(data);

// Callback отримує (обробленеЗображення, списокМаркерів)
```

## Посилання

- [Оригінальна бібліотека ArUco](https://www.uco.es/investiga/grupos/ava/portfolio/aruco/)
- [js-aruco (оригінальний форк)](https://github.com/jcmellado/js-aruco)
- [OpenCV](https://opencv.org/) — основа комп'ютерного зору
- [Алгоритм POSIT](http://www.cfar.umd.edu/~daniel/daniel_papersfordownload/CoplanarPts.pdf) — оцінка пози

## Ліцензія

Ліцензія BSD (див. `LICENSE.txt`)
