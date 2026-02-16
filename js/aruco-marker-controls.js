/**
 * Контролер для ArUco-маркерів
 * Інтегрується з js-aruco2 для виявлення та відстеження ArUco-маркерів
 */

// Перевіряємо, чи існує AR простір імён
if (typeof AR === 'undefined') {
    console.error('AR namespace not found. Make sure aruco.js is loaded.');
}

// Клас для контролю ArUco-маркерів
THREEx.ArUcoMarkerControls = function(arContext, object3d, parameters) {
    var _this = this;
    
    // Зберігаємо параметри
    this.parameters = {
        // Тип маркера - за замовчуванням ARUCO
        dictionaryName: 'ARUCO',
        // ID маркера, який ми очікуємо знайти
        markerId: null,
        // Розмір маркера в метрах
        size: 1,
        // Максимальна відстань Хеммінга для визначення маркера
        maxHammingDistance: 0
    };
    
    // Оновлюємо параметри з переданими значеннями
    Object.assign(this.parameters, parameters);
    
    // Перевіряємо, чи існує вказаний словник
    if (!AR.DICTIONARIES[this.parameters.dictionaryName]) {
        // Використовуємо стандартний словник ARUCO як запасний варіант
        this.parameters.dictionaryName = 'ARUCO';
    }

    // Налаштовуємо параметри детектора в залежності від типу словника
    const detectorParams = {
        dictionaryName: this.parameters.dictionaryName,
        maxHammingDistance: this.parameters.maxHammingDistance
    };

    // Для 4x4 словників збільшуємо maxHammingDistance для кращого розпізнавання
    if (this.parameters.dictionaryName.includes('4X4')) {
        detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 2; // Збільшуємо для 4x4
    }
    // Для 5x5 словників також можемо встановити оптимальне значення maxHammingDistance
    else if (this.parameters.dictionaryName.includes('5X5')) {
        detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 2; // Збільшуємо для 5x5
    }
    // Для 7x7 словників також можемо встановити оптимальне значення maxHammingDistance
    else if (this.parameters.dictionaryName.includes('7X7')) {
        detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 3; // Збільшуємо для 7x7
    }
    
    this.detector = new AR.Detector(detectorParams);
    
    // Зберігаємо контекст та об'єкт
    this.arContext = arContext;
    this.object3d = object3d;
    
    // Поточний стан маркера
    this.currentMarker = null;
    
    // Останній виявлений маркер
    this.lastDetectedMarker = null;
    
    // Позиція та обертання для об'єкта
    this.matrix = new THREE.Matrix4();
    
    // Позиція та обертання для об'єкта
    this.object3d.matrixAutoUpdate = false;
};

// Метод для оновлення позиції та обертання на основі виявленого маркера
THREEx.ArUcoMarkerControls.prototype.update = function(sourceImageData) {
    // Виявляємо маркери на зображенні
    var markers = this.detector.detect(sourceImageData);

    // Якщо знайдено маркери
    if (markers && markers.length > 0) {
        // Шукаємо конкретний маркер за ID, якщо він вказаний
        if (this.parameters.markerId !== null) {
            var targetMarker = null;
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].id === this.parameters.markerId) {
                    targetMarker = markers[i];
                    break;
                }
            }

            if (targetMarker) {
                this.processMarker(targetMarker);
                this.lastDetectedMarker = targetMarker;
                
                // Додатково встановлюємо властивість для відстеження стану виявлення
                this.inCurrent = true;
                
                
                // Встановлюємо об'єкт як видимий при виявленні маркера
                this.object3d.visible = true;
                
                

                return true;
            }
        } else {
            // Якщо ID не вказано, використовуємо перший знайдений маркер
            this.processMarker(markers[0]);
            this.lastDetectedMarker = markers[0];
            return true;
        }
    } else {
        // Якщо маркер не виявлено, ховаємо об'єкт
        this.object3d.visible = false;
        this.lastDetectedMarker = null;
    }

    return false;
};

// Метод для обробки виявленого маркера
THREEx.ArUcoMarkerControls.prototype.processMarker = function(marker) {
    // Оновлюємо позицію та обертання об'єкта на основі кутів маркера
    // Для цього використовуємо POS.Posit для обчислення позиції та обертання

    // Отримуємо розміри зображення з контексту AR для правильного масштабування
    var videoWidth = this.arContext.arController.canvas.width;
    var videoHeight = this.arContext.arController.canvas.height;
    var posit = new POS.Posit(this.parameters.size, videoWidth); // використовуємо ширину як фокусну відстань

    // Потрібно відцентрувати кути маркера
    var corners = [];
    for (var i = 0; i < marker.corners.length; i++) {
        var corner = {
            x: marker.corners[i].x - (videoWidth / 2),
            y: (videoHeight / 2) - marker.corners[i].y
        };
        corners.push(corner);
    }

    // Обчислюємо позицію та обертання
    var pose = posit.pose(corners);
    

    if (pose) {
        // Оновлюємо матрицю об'єкта
        this.updateObject3D(pose.bestTranslation, pose.bestRotation);

        // Показуємо об'єкт
        this.object3d.visible = true;

    }
};

// Метод для оновлення позиції та обертання об'єкта
THREEx.ArUcoMarkerControls.prototype.updateObject3D = function(translation, rotation) {
    // Створюємо матрицю перетворення на основі обертання та перекладу
    var matrix = new THREE.Matrix4();
    var elements = matrix.elements;
    
    // Заповнюємо матрицю обертання
    elements[0] = rotation[0][0]; elements[1] = rotation[0][1]; elements[2] = rotation[0][2]; elements[3] = 0;
    elements[4] = rotation[1][0]; elements[5] = rotation[1][1]; elements[6] = rotation[1][2]; elements[7] = 0;
    elements[8] = rotation[2][0]; elements[9] = rotation[2][1]; elements[10] = rotation[2][2]; elements[11] = 0;
    
    // Додаємо переклад
    elements[12] = translation[0];
    elements[13] = translation[1];
    elements[14] = translation[2];
    
    // Останній стовпець стандартний для афінного перетворення
    elements[3] = 0; elements[7] = 0; elements[11] = 0; elements[15] = 1;
    
    // Застосовуємо матрицю до об'єкта
    this.object3d.matrix.copy(matrix);
    
    // Декомпонуємо матрицю на позицію, кватерніон та масштаб
    this.object3d.matrix.decompose(this.object3d.position, this.object3d.quaternion, this.object3d.scale);
    
    // Інвертуємо Z-координату, щоб узгодити з системою координат ARToolKit
    this.object3d.position.z *= -1;
    
    // Оновлюємо матрицю на основі зміненої позиції
    this.object3d.updateMatrix();
    
    // Позначаємо, що матриця не повинна автоматично оновлюватися
    this.object3d.matrixAutoUpdate = false;
    
};

// Метод для отримання останнього виявленого маркера
THREEx.ArUcoMarkerControls.prototype.getLastDetectedMarker = function() {
    return this.lastDetectedMarker;
};

// Метод для зміни параметрів детектора
THREEx.ArUcoMarkerControls.prototype.setParameters = function(params) {
    Object.assign(this.parameters, params);

    // Якщо змінився словник, створюємо новий детектор
    if (params.dictionaryName) {
        // Перевіряємо, чи існує вказаний словник
        if (!AR.DICTIONARIES[params.dictionaryName]) {
            // Використовуємо стандартний словник ARUCO як запасний варіант
            this.parameters.dictionaryName = 'ARUCO';
        }
        
        // Налаштовуємо параметри детектора в залежності від типу словника
        const detectorParams = {
            dictionaryName: this.parameters.dictionaryName,
            maxHammingDistance: this.parameters.maxHammingDistance
        };

        // Для 4x4 словників збільшуємо maxHammingDistance для кращого розпізнавання
        if (this.parameters.dictionaryName.includes('4X4')) {
            detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 2; // Збільшуємо для 4x4
        }
        // Для 5x5 словників також можемо встановити оптимальне значення maxHammingDistance
        else if (this.parameters.dictionaryName.includes('5X5')) {
            detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 2; // Збільшуємо для 5x5
        }
        // Для 7x7 словників також можемо встановити оптимальне значення maxHammingDistance
        else if (this.parameters.dictionaryName.includes('7X7')) {
            detectorParams.maxHammingDistance = this.parameters.maxHammingDistance > 0 ? this.parameters.maxHammingDistance : 3; // Збільшуємо для 7x7
        }

        this.detector = new AR.Detector(detectorParams);
    }
};