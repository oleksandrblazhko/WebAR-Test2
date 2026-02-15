# Документація для WebAR-BoardGame

## Налаштування роздільної здатності
Додано можливість налаштовувати роздільну здатність веб-камери через конфігураційний файл `config.json`.

### Варіанти налаштувань:
- `"high"` - 1280x720 (висока роздільна здатність)
- `"low"` - 640x480 (низька роздільна здатність, за замовчуванням)

### Приклад налаштування:
```json
{
  "settings": {
    "resolution": "high"
  }
}
```

## Налаштування привітального тексту
Додано можливість налаштовувати привітальний текст, який відображається перед входом у WebAR-застосунок.

### Приклад налаштування:
```json
{
  "settings": {
    "welcomeText": "Press here<br>to enter the WebAR-Board Game"
  }
}
```

## Типи контенту
- `model` - складна 3D-модель
- `primitive` - примітивна 3D-модель
- `image` - зображення
- `video` - відео
- `controller` - інтерактивний контролер (зелений куб)
- `text` - текстовий контент

## Структура конфігурації маркерів
Кожен маркер має наступну структуру:
- `id` - унікальний ідентифікатор
- `type` - тип маркера ("pattern" або "barcode")
- `target` - шлях до файлу патерну або номер баркоду
- `contentType` - тип контенту
- Додаткові параметри залежно від типу контенту

## Тип контенту `text`
Тип контенту `text` дозволяє відображати текстові елементи у просторі AR.

### Параметри тексту:
- `content` - текстовий вміст
- `size` - розмір тексту
- `height` - висота тексту
- `color` - колір тексту (у форматі hex, наприклад "#ff0000")

### Приклад:
```json
{
  "id": 1,
  "type": "barcode", 
  "target": 1,
  "contentType": "text",
  "text": {
    "content": "2",
    "size": 1.5,
    "height": 0.1,
    "color": "#ffff00"
  }
}
```

## Альтернативний контент (`alternativeContent`)
Можна вказати альтернативний контент, який відображається при певних умовах - коли контролер (інтерактивний об'єкт) торкається об'єкта, пов'язаного з маркером.

### Приклад:
```json
{
  "id": 0,
  "type": "pattern",
  "target": "pattern-ScanMe.patt",
  "contentType": "video",
  "contentFile": "waterfall.mp4",
  "alternativeContent": {
    "contentType": "primitive",
    "primitive": {
      "type": "SphereGeometry",
      "radius": 0.8,
      "widthSegments": 16,
      "heightSegments": 16,
      "color": "#ff6600",
      "animation": { "type": "rotation", "axis": "y", "speed": 0.02 }
    }
  }
}
```

## Аудіо при взаємодії (`audioFile` та `playOnControllerIntersect`)
Можна вказати аудіофайл, який відтворюється при взаємодії з контролером.

### Параметри:
- `audioFile` - шлях до аудіофайлу
- `playOnControllerIntersect` - відтворювати при перетині з контролером (true/false)

Якщо `playOnControllerIntersect` дорівнює `true`, аудіо відтворюється тільки тоді, коли контролер торкається об'єкта, пов'язаного з маркером. Якщо `false`, аудіо відтворюється при виявленні маркера.

### Приклад:
```json
{
  "id": 1,
  "type": "barcode", 
  "target": 1,
  "contentType": "text",
  "text": {
    "content": "2",
    "size": 1.5,
    "height": 0.1,
    "color": "#ffff00"
  },
  "audioFile": "wrong_answer.mp3",
  "playOnControllerIntersect": true
}
```

## Приклади конфігурацій для типу "primitive"
Тип контенту `primitive` дозволяє створювати прості 3D-фігури без необхідності завантажувати зовнішні 3D-моделі.

### Підтримувані типи геометрій
- `BoxGeometry` - куб або прямокутний паралелепіпед
- `SphereGeometry` - сфера
- `CylinderGeometry` - циліндр
- `ConeGeometry` - конус
- `TorusGeometry` - тор (бублик)

### Параметри примітиву
- `type` - тип геометрії (BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry)
- `size` - розміри для BoxGeometry [ширина, висота, глибина]
- `radius` - радіус для SphereGeometry, ConeGeometry, TorusGeometry
- `height` - висота для ConeGeometry, CylinderGeometry
- `tubeRadius` - радіус трубки для TorusGeometry
- `widthSegments`, `heightSegments` - сегменти для SphereGeometry
- `radiusTop`, `radiusBottom`, `radialSegments` - параметри для CylinderGeometry
- `tubularSegments` - сегменти трубки для TorusGeometry
- `color` - колір об'єкта (у форматі hex, наприклад "#ff0000")
- `textureFile` - шлях до текстурного файлу для застосування до поверхні (опційно)
- `position` - позиція об'єкта [x, y, z]
- `rotation` - обертання об'єкта [x, y, z] у радіанах
- `animation` - параметри анімації (опційно)

## Анімація для примітивів та 3D-моделей
Тепер підтримується анімація обертання як для примітивів, так і для 3D-моделей з наступними параметрами:

- `type` - тип анімації ("rotation")
- `axis` - вісь обертання ("x", "y" або "z")
- `speed` - швидкість обертання (числове значення)

## Приклади конфігурацій

### Куб з текстурою та анімацією обертання
```json
{
  "id": 5,
  "type": "barcode",
  "target": 3,
  "contentType": "primitive",
  "primitive": {
    "type": "BoxGeometry",
    "size": [1, 1, 1],
    "color": "#ff0000",
    "textureFile": "texture_blue.jpg",
    "animation": { "type": "rotation", "axis": "y", "speed": 0.01 }
  }
}
```

### Сфера з текстурою та анімацією обертання
```json
{
  "id": 7,
  "type": "barcode",
  "target": 4,
  "contentType": "text",
  "text": {
    "content": "3",
    "size": 1.5,
    "height": 0.1,
    "color": "#00ff00"
  },
  "alternativeContent": {
    "contentType": "primitive",
    "primitive": {
      "type": "BoxGeometry",
      "size": [1.2, 1.2, 1.2],
      "color": "#ff0066",
      "textureFile": "texture_blue.jpg",
      "animation": { "type": "rotation", "axis": "z", "speed": 0.025 }
    }
  },
  "audioFile": "correct_answer.mp3",
  "playOnControllerIntersect": true
}
```

### 3D модель з анімацією
```json
{
  "id": 2,
  "type": "pattern",
  "target": "pattern-Cat.patt",
  "contentType": "model",
  "contentFile": "cat.gltf",
  "modelScale": 0.3,
  "rotation": { "x": 1.5708, "y": 2.5 },
  "animation": { "type": "rotation", "axis": "z", "speed": 0.01 },
  "alternativeContent": {
    "contentType": "model",
    "contentFile": "Bender.glb",
    "modelScale": 0.3,
    "position": { "z": -0.5 },
    "rotation": { "y": -1.5707963267948966, "x": -1.0 },
    "animation": { "type": "rotation", "axis": "y", "speed": 0.01 }
  }
}
```

### Контролер
```json
{
  "id": 11,
  "type": "barcode",
  "target": 7,
  "contentType": "controller"
}
```

## Необхідні файли
Для правильної роботи проекту необхідно мати наступні файли в кореневому каталозі:

- `helvetiker_regular.typeface.json` - файл шрифту для відображення текстових елементів
- Інші файли, вказані в конфігурації (моделі, зображення, відео, аудіо тощо)