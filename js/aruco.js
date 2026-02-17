// js/aruco.js

/**
 * @author Alex P.
 * @author D. Falcioni
 * @author Google Gemini
 * 
 * Цей модуль забезпечує розпізнавання Aruco-маркерів та інтеграцію з three.js.
 * Він використовує бібліотеку js-aruco2 для детектування маркерів та POSIT для оцінки 3D пози.
 */
var ArucoMarkerControls = function (arToolkitContext, object3d, parameters, canvasWidth) {
    var _this = this;

    this.object3d = object3d;
    this.id = parameters.id; // ID Aruco-маркера для відстеження
    this.object3d.rotation.order = 'YXZ'; // Встановлюємо порядок обертання

    // Persistence mechanism for smoother tracking
    this.framesLost = 0;
    this.maxFramesLost = 5; // Keep visible for 5 frames after loss of detection
    this.lastPose = null;

    // --- Ініціалізація детектора ---
    // Детектор ініціалізується один раз і зберігається у статичній змінній,
    // щоб уникнути зайвих ініціалізацій для кожного маркера.
    if (!ArucoMarkerControls.detector) {
        var dictionaryName = parameters.dictionaryName || 'ARUCO_4X4_1000';
        ArucoMarkerControls.detector = new AR.Detector({
            dictionaryName: dictionaryName
        });
        console.log('Aruco detector initialized for dictionary:', dictionaryName);
    }
    this.detector = ArucoMarkerControls.detector;

    // --- Ініціалізація POSIT ---
    // POSIT використовується для визначення 3D-позиції маркера.
    // Також ініціалізується один раз.
    if (!ArucoMarkerControls.posit) {
        var modelSize = parameters.modelSize || 35.0; // Розмір маркера в міліметрах.
        ArucoMarkerControls.posit = new POS.Posit(modelSize, canvasWidth);
        console.log('Posit initialized with modelSize:', modelSize, 'and canvasWidth:', canvasWidth);
    }
    this.posit = ArucoMarkerControls.posit;
    
    // Початково об'єкт невидимий, доки не буде знайдено маркер.
    this.object3d.visible = false;

    /**
     * Функція оновлення стану маркера.
     * Викликається у головному циклі анімації.
     */
    this.update = function (arToolkitSource) {
        var arController = arToolkitContext.arController;
        var video = arToolkitSource.domElement;

        // Перевіряємо, чи готове відео для обробки.
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        // Отримуємо поточний кадр з відео.
        var canvas = arController.canvas;
        var context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Детектуємо маркери на кадрі.
        var markers = _this.detector.detect(imageData);
        
        // Шукаємо маркер з потрібним ID.
        var foundMarker = markers.find(marker => marker.id === _this.id);

        if (foundMarker) {
            _this.framesLost = 0; // Reset lost frames counter
            _this.object3d.visible = true; // Make object visible

            var corners = foundMarker.corners;
            
            // POSIT вимагає координати кутів, центровані відносно центру канвасу.
            var centeredCorners = corners.map(corner => ({
                x: corner.x - (canvas.width / 2),
                y: (canvas.height / 2) - corner.y
            }));

            // Оцінюємо 3D позу маркера.
            var pose = _this.posit.pose(centeredCorners);
            
           if (pose) {
                    let chosenPose = pose; // Default to 'best'
   
                    // --- Pose Stabilization Logic ---
                    if (_this.lastPose) {
                        const distBest = new THREE.Vector3().fromArray(pose.bestTranslation)
                            .distanceTo(new THREE.Vector3().fromArray(_this.lastPose.translation));
   
                        const distAlt = new THREE.Vector3().fromArray(pose.alternativeTranslation)
                            .distanceTo(new THREE.Vector3().fromArray(_this.lastPose.translation));
   
                        // Heuristic: if the alternative pose is closer, and the best pose represents a significant "jump",
                        // it's likely a flip. Use the alternative instead.
                        if (distAlt < distBest && distBest > 2) { // The '2' is a threshold in mm, can be tuned
                             chosenPose = {
                                bestRotation: pose.alternativeRotation,
                                bestTranslation: pose.alternativeTranslation
                             };
                        }
                    }
   
                    // Store the translation of the chosen pose for the next frame
                    _this.lastPose = { translation: chosenPose.bestTranslation };
                    // --- End of Stabilization Logic ---
   
                    var rotation = chosenPose.bestRotation;
                    var translation = chosenPose.bestTranslation;
                    var scaleFactor = 35.0; // The original model size in mm
   
                    // Create the matrix from the POSIT result, with scaled translation
                    var poseMatrix = new THREE.Matrix4();
                    poseMatrix.set(
                        rotation[0][0], rotation[0][1],  rotation[0][2], translation[0] / scaleFactor,
                        rotation[1][0], rotation[1][1],  rotation[1][2], translation[1] / scaleFactor,
                       -rotation[2][0],-rotation[2][1], -rotation[2][2],-translation[2] / scaleFactor,
                        0,              0,               0,              1
                    );
   
                    // Create the correction matrix to make the cone "stand up"
                    var correctionMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
   
                    // Combine the matrices
                    _this.object3d.matrix.multiplyMatrices(poseMatrix, correctionMatrix);
   
                    // Decompose the final matrix into position, quaternion, and scale.
                    _this.object3d.matrix.decompose(_this.object3d.position, _this.object3d.quaternion, _this.object3d.scale);
            }
        } else {
            _this.framesLost++; // Increment lost frames counter
            if (_this.framesLost > _this.maxFramesLost) {
                _this.object3d.visible = false; // Hide object only after grace period
            }
        }
    };
};

// Статичні змінні для спільного використання детектора та posit між усіма екземплярами контролерів.
ArucoMarkerControls.detector = null;
ArucoMarkerControls.posit = null;
