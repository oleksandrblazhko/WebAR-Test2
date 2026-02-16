# Приклади конфігурацій для 5x5 ArUco маркерів

Цей файл містить приклади конфігурацій для використання 5x5 ArUco маркерів у вашому проекті.

## 1. Простий 5x5 ArUco маркер

```json
{
  "id": 20,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 10,
  "contentType": "model",
  "contentFile": "model.glb",
  "modelScale": 0.3
}
```

## 2. 5x5 ArUco маркер з альтернативним вмістом

```json
{
  "id": 21,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 25,
  "contentType": "model",
  "contentFile": "Octopus_toy.glb",
  "modelScale": 0.3,
  "alternativeContent": {
    "contentType": "primitive",
    "primitive": {
      "type": "SphereGeometry",
      "radius": 0.8,
      "widthSegments": 16,
      "heightSegments": 16,
      "color": "#ff6600",
      "animation": {
        "property": "rotation.y",
        "speed": 0.02
      }
    }
  }
}
```

## 3. 5x5 ArUco маркер з примітивним вмістом та анімацією

```json
{
  "id": 22,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 30,
  "contentType": "primitive",
  "primitive": {
    "type": "TorusGeometry",
    "radius": 0.5,
    "tubeRadius": 0.2,
    "radialSegments": 16,
    "tubularSegments": 32,
    "color": "#ff00ff",
    "textureFile": "texture_red.jpg",
    "animation": {
      "property": "rotation.x",
      "speed": 0.02
    }
  }
}
```

## 4. 5x5 ArUco маркер з текстовим вмістом

```json
{
  "id": 23,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 40,
  "contentType": "text",
  "text": {
    "content": "5x5 Маркер",
    "size": 1.0,
    "height": 0.1,
    "color": "#00ffff"
  },
  "alternativeContent": {
    "contentType": "primitive",
    "primitive": {
      "type": "ConeGeometry",
      "radius": 0.5,
      "height": 1,
      "radialSegments": 16,
      "color": "#ffff00",
      "animation": {
        "property": "rotation.y",
        "speed": 0.01
      }
    }
  }
}
```

## 5. 5x5 ArUco маркер з відео вмістом

```json
{
  "id": 24,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 50,
  "contentType": "video",
  "contentFile": "waterfall.mp4",
  "alternativeContent": {
    "contentType": "model",
    "contentFile": "Bender.glb",
    "modelScale": 0.3
  }
}
```

## Порівняння характеристик словників

| Словник | Розмір маркера | Кількість унікальних маркерів | Рекомендоване використання |
|---------|----------------|-------------------------------|---------------------------|
| ARUCO | 4x4 | 256 | Прості застосунки |
| ARUCO_4X4_1000 | 4x4 | 1000 | Більше унікальних маркерів |
| ARUCO_5X5_1000 | 5x5 | 1000 | Баланс між точністю та кількістю унікальних маркерів |
| ARUCO_7X7_1000 | 7x7 | 1000 | Краща точність та надійність |

## Особливості 5x5 ArUco маркерів

- **Розмір**: 5x5 пікселі (3x3 внутрішніх даних + 1-піксельна рамка)
- **Унікальність**: 1000 унікальних маркерів у словнику ARUCO_5X5_1000
- **Точність**: Краща точність розпізнавання ніж 4x4, але менша ніж 7x7
- **Використання**: Ідеально підходить для середніх за складністю застосункань

## Поради щодо використання

1. **Для 5x5 маркерів** рекомендується встановлювати `maxHammingDistance` до 2 для кращого розпізнавання
2. 5x5 маркери потребують більше пікселів на екрані ніж 4x4, але менше ніж 7x7
3. Для найкращих результатів друкуйте маркери на високоякісному принтері
4. Переконайтесь, що маркер добре освітлений без затемнень