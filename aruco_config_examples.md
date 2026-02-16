# Приклади конфігурацій для ArUco маркерів

Цей файл містить приклади конфігурацій для використання різних типів ArUco маркерів у вашому проекті.

## 1. Простий 4x4 ArUco маркер

```json
{
  "id": 10,
  "type": "aruco",
  "dictionary": "ARUCO_4X4_1000",
  "markerId": 10,
  "contentType": "model",
  "contentFile": "model.glb",
  "modelScale": 0.3
}
```

## 2. Простий 5x5 ArUco маркер

```json
{
  "id": 11,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 12,
  "contentType": "model",
  "contentFile": "Octopus_toy.glb",
  "modelScale": 0.3
}
```

## 3. Простий 7x7 ArUco маркер

```json
{
  "id": 12,
  "type": "aruco",
  "dictionary": "ARUCO_7X7_1000",
  "markerId": 15,
  "contentType": "model",
  "contentFile": "Octopus_toy.glb",
  "modelScale": 0.3
}
```

## 4. 5x5 ArUco маркер з альтернативним вмістом

```json
{
  "id": 13,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 22,
  "contentType": "model",
  "contentFile": "kopatuch.glb",
  "modelScale": 100,
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

## 5. 7x7 ArUco маркер з альтернативним вмістом

```json
{
  "id": 14,
  "type": "aruco",
  "dictionary": "ARUCO_7X7_1000",
  "markerId": 25,
  "contentType": "model",
  "contentFile": "kopatuch.glb",
  "modelScale": 100,
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

## 6. 5x5 ArUco маркер з примітивним вмістом та анімацією

```json
{
  "id": 15,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 32,
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

## 7. 7x7 ArUco маркер з примітивним вмістом та анімацією

```json
{
  "id": 16,
  "type": "aruco",
  "dictionary": "ARUCO_7X7_1000",
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

## 8. 5x5 ArUco маркер з текстовим вмістом

```json
{
  "id": 17,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 42,
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

## 9. 7x7 ArUco маркер з текстовим вмістом

```json
{
  "id": 18,
  "type": "aruco",
  "dictionary": "ARUCO_7X7_1000",
  "markerId": 40,
  "contentType": "text",
  "text": {
    "content": "7x7 Маркер",
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

## 10. 5x5 ArUco маркер з відео вмістом

```json
{
  "id": 19,
  "type": "aruco",
  "dictionary": "ARUCO_5X5_1000",
  "markerId": 52,
  "contentType": "video",
  "contentFile": "waterfall.mp4",
  "alternativeContent": {
    "contentType": "model",
    "contentFile": "Bender.glb",
    "modelScale": 0.3
  }
}
```

## 11. 7x7 ArUco маркер з відео вмістом

```json
{
  "id": 20,
  "type": "aruco",
  "dictionary": "ARUCO_7X7_1000",
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

## Поради щодо використання

1. **Для 5x5 маркерів** рекомендується встановлювати `maxHammingDistance` до 2 для кращого розпізнавання
2. **Для 7x7 маркерів** рекомендується встановлювати `maxHammingDistance` до 3 для кращого розпізнавання
3. 5x5 та 7x7 маркери потребують більше пікселів на екрані для надійного розпізнавання ніж 4x4
4. Для найкращих результатів друкуйте маркери на високоякісному принтері
5. Переконайтесь, що маркер добре освітлений без затемнень