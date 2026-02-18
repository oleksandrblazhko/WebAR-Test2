// js/aruco.js

/**
 * @author Alex P.
 * @author D. Falcioni
 * @author Google Gemini
 *
 * Цей модуль забезпечує розпізнавання Aruco-маркерів та інтеграцію з three.js.
 * Він використовує бібліотеку js-aruco2 для детектування маркерів та POSIT для оцінки 3D пози.
 * Оновлено для використання стабільної логіки на основі матриць та правильного масштабування.
 */

// Спільний detection canvas для всіх маркерів (як у 4x4-3d.html)
// Використовуємо нижчу роздільну здатність для обробки (640x480) для кращої продуктивності
var detectionCanvas = null;
var detectionContext = null;
var canvasWidthGlobal = null;
var canvasHeightGlobal = null;
var DETECTION_WIDTH = 640;  // Роздільна здатність для обробки (нижча = швидше)
var DETECTION_HEIGHT = 480; // Співвідношення 4:3

var ArucoMarkerControls = function (arToolkitContext, object3d, parameters, canvasWidth) {
    var _this = this;

    this.object3d = object3d;
    this.id = parameters.id;
    this.modelSize = parameters.modelSize; // Розмір маркера в мм (має передаватися з конфігурації)

    // Змінні для згладжування видимості
    this.framesLost = 0;
    this.maxFramesLost = 60; // Збільшено: конус не зникає при великих кутах огляду

    // Змінні для інтерполяції позиції (LERP) для плавності
    this.targetPosition = new THREE.Vector3();
    this.targetQuaternion = new THREE.Quaternion();
    this.currentPosition = new THREE.Vector3();
    this.currentQuaternion = new THREE.Quaternion();
    this.lerpFactor = 0.5; // Коефіцієнт інтерполяції (0.1 = дуже плавно, 0.5 = швидше, 1.0 = без інтерполяції)
    this.firstUpdate = true;

    // Ініціалізація детектора (один раз для всіх маркерів)
    if (!ArucoMarkerControls.detector) {
        var dictionaryName = parameters.dictionaryName || 'ARUCO_4X4_1000';
        ArucoMarkerControls.detector = new AR.Detector({
            dictionaryName: dictionaryName
        });
        console.log('Aruco detector initialized for dictionary:', dictionaryName);
    }
    this.detector = ArucoMarkerControls.detector;

    // Ініціалізація POSIT (один раз для всіх маркерів)
    // Використовуємо DETECTION_WIDTH для POSIT, а не canvasWidth
    if (!ArucoMarkerControls.posit) {
        ArucoMarkerControls.posit = new POS.Posit(this.modelSize, DETECTION_WIDTH);
        console.log('Posit initialized with modelSize:', this.modelSize, 'and detectionWidth:', DETECTION_WIDTH);
    }
    this.posit = ArucoMarkerControls.posit;

    // Ініціалізація спільного detection canvas (як у 4x4-3d.html)
    if (!detectionCanvas) {
        detectionCanvas = document.createElement('canvas');
        detectionContext = detectionCanvas.getContext('2d');
        canvasWidthGlobal = DETECTION_WIDTH;
        canvasHeightGlobal = DETECTION_HEIGHT;
        detectionCanvas.width = canvasWidthGlobal;
        detectionCanvas.height = canvasHeightGlobal;
        console.log('Detection canvas initialized:', DETECTION_WIDTH + 'x' + DETECTION_HEIGHT);
    }

    // Об'єкт невидимий, доки маркер не знайдено
    this.object3d.visible = false;

    /**
     * Функція для оновлення позиції 3D-об'єкта через пряме встановлення quaternion та position.
     * Цей підхід забезпечує більшу стабільність порівняно з matrix.decompose().
     * @param {Array} rotation - Матриця обертання 3x3 від POSIT.
     * @param {Array} translation - Вектор переміщення від POSIT.
     */
    var updateObjectPose = function(rotation, translation) {
        var object = _this.object3d;

        // Створюємо матрицю обертання з даних POSIT
        var rotMatrix = new THREE.Matrix4();
        rotMatrix.set(
            rotation[0][0], rotation[0][1], rotation[0][2], 0,
            rotation[1][0], rotation[1][1], rotation[1][2], 0,
            rotation[2][0], rotation[2][1], rotation[2][2], 0,
            0, 0, 0, 1
        );

        // Встановлюємо кватерніон з матриці обертання (без корекції - геометрія вже правильно орієнтована)
        _this.targetQuaternion.setFromRotationMatrix(rotMatrix);

        // Встановлення позиції (як у 4x4-3d.html, тільки інвертуємо Z)
        _this.targetPosition.set(
            translation[0],
            translation[1],
            -translation[2]
        );

        // Ініціалізуємо поточну позицію при першому оновленні
        if (_this.firstUpdate) {
            _this.currentPosition.copy(_this.targetPosition);
            _this.currentQuaternion.copy(_this.targetQuaternion);
            _this.firstUpdate = false;
        }

        // Ітерполяція позиції (LERP) для плавності
        _this.currentPosition.lerp(_this.targetPosition, _this.lerpFactor);

        // Ітерполяція кватерніона (SLERP) для плавного обертання
        _this.currentQuaternion.slerp(_this.targetQuaternion, _this.lerpFactor);

        // Застосовуємо інтерпольовані значення до об'єкта
        object.position.copy(_this.currentPosition);
        object.quaternion.copy(_this.currentQuaternion);
    };

    /**
     * Головна функція оновлення, викликається на кожному кадрі.
     */
    this.update = function (arToolkitSource, preDetectedMarkers) {
        var video = arToolkitSource.domElement;

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        var markers = preDetectedMarkers;
        
        // Якщо маркери не передані, детектуємо самостійно (для сумісності)
        if (!markers) {
            // Малюємо відео на кешований canvas (як у 4x4-3d.html)
            detectionContext.drawImage(video, 0, 0, detectionCanvas.width, detectionCanvas.height);
            
            // Отримуємо imageData з кешованого canvas
            var imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height);
            markers = _this.detector.detect(imageData);
        }
        
        var foundMarker = markers.find(marker => marker.id === _this.id);
        var markerFoundAndPoseOk = false;

        if (foundMarker) {
            var corners = foundMarker.corners.map(corner => ({
                x: corner.x - (detectionCanvas.width / 2),
                y: (detectionCanvas.height / 2) - corner.y
            }));

            var pose = _this.posit.pose(corners);

            if (pose) {
                updateObjectPose(pose.bestRotation, pose.bestTranslation);
                markerFoundAndPoseOk = true;
            }
        }

        // Логіка згладжування
        if (markerFoundAndPoseOk) {
            _this.object3d.visible = true;
            _this.framesLost = 0;
        } else {
            _this.framesLost++;
            if (_this.framesLost > _this.maxFramesLost) {
                _this.object3d.visible = false;
            }
        }
    };
};

// Статичні змінні для спільного використання детектора та posit
ArucoMarkerControls.detector = null;
ArucoMarkerControls.posit = null;

// Експортуємо функцію для отримання спільного canvas
ArucoMarkerControls.getDetectionCanvas = function() {
    return detectionCanvas;
};

// Експортуємо функцію для детектування маркерів один раз на кадр
ArucoMarkerControls.detectMarkers = function(arToolkitSource) {
    if (!detectionCanvas || !detectionContext) {
        return [];
    }
    
    var video = arToolkitSource.domElement;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return [];
    }
    
    detectionContext.drawImage(video, 0, 0, detectionCanvas.width, detectionCanvas.height);
    var imageData = detectionContext.getImageData(0, 0, detectionCanvas.width, detectionCanvas.height);
    
    if (ArucoMarkerControls.detector) {
        return ArucoMarkerControls.detector.detect(imageData);
    }
    
    return [];
};
