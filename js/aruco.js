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
    this.maxFramesLost = 100; // Keep visible for 100 frames after loss of detection (збільшено для стабільності)
    this.lastPose = null;
    this.lastNormalY = 0.9; // Початково очікуємо, що нормаль дивиться вгору

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
        var modelSize = parameters.modelSize || 35.0; // Розмір маркера в міліметрах (з конфігурації).
        ArucoMarkerControls.posit = new POS.Posit(modelSize, canvasWidth);
        console.log('Posit initialized with modelSize:', modelSize, 'and canvasWidth:', canvasWidth);
    }
    this.posit = ArucoMarkerControls.posit;

    // Початково об'єкт видимий (щоб конус було видно навіть без маркера)
    this.object3d.visible = true;
    console.log(`[ArucoMarkerControls] Marker ${this.id} initialized, visible=${this.object3d.visible}`);

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
   
                    // --- Обчислюємо нормалі для обох поз ---
                    var rotationMatrixBest = new THREE.Matrix4();
                    rotationMatrixBest.set(
                        pose.bestRotation[0][0], pose.bestRotation[0][1], pose.bestRotation[0][2], 0,
                        pose.bestRotation[1][0], pose.bestRotation[1][1], pose.bestRotation[1][2], 0,
                        pose.bestRotation[2][0], pose.bestRotation[2][1], pose.bestRotation[2][2], 0,
                        0, 0, 0, 1
                    );
                    var localNormal = new THREE.Vector3(0, 0, 1);
                    var worldNormalBest = localNormal.clone().applyMatrix4(rotationMatrixBest);
                    
                    var rotationMatrixAlt = new THREE.Matrix4();
                    rotationMatrixAlt.set(
                        pose.alternativeRotation[0][0], pose.alternativeRotation[0][1], pose.alternativeRotation[0][2], 0,
                        pose.alternativeRotation[1][0], pose.alternativeRotation[1][1], pose.alternativeRotation[1][2], 0,
                        pose.alternativeRotation[2][0], pose.alternativeRotation[2][1], pose.alternativeRotation[2][2], 0,
                        0, 0, 0, 1
                    );
                    var worldNormalAlt = localNormal.clone().applyMatrix4(rotationMatrixAlt);
   
                    // --- Pose Stabilization Logic ---
                    // Обираємо позу, у якої нормаль ближча до попередньої стабільної нормалі
                    if (_this.lastNormalY !== null) {
                        const diffBest = Math.abs(worldNormalBest.y - _this.lastNormalY);
                        const diffAlt = Math.abs(worldNormalAlt.y - _this.lastNormalY);
                        
                        // Якщо нормалі різні (одна +, інша -), обираємо ту, що ближча до попередньої
                        if (diffAlt < diffBest && Math.abs(diffBest - diffAlt) > 0.5) {
                            chosenPose = {
                                bestRotation: pose.alternativeRotation,
                                bestTranslation: pose.alternativeTranslation
                            };
                            console.log(`[Marker ${_this.id}] SWAP: alt обрано замість best (nAlt=${worldNormalAlt.y.toFixed(2)}, nBest=${worldNormalBest.y.toFixed(2)})`);
                        }
                    }
   
                    // Store the chosen pose for the next frame
                    _this.lastPose = { 
                        translation: chosenPose.bestTranslation,
                        rotation: chosenPose.bestRotation
                    };
                    
                    // Оновлюємо останню нормаль (з деякою інерцією)
                    var chosenRotationMatrix = new THREE.Matrix4();
                    chosenRotationMatrix.set(
                        chosenPose.bestRotation[0][0], chosenPose.bestRotation[0][1], chosenPose.bestRotation[0][2], 0,
                        chosenPose.bestRotation[1][0], chosenPose.bestRotation[1][1], chosenPose.bestRotation[1][2], 0,
                        chosenPose.bestRotation[2][0], chosenPose.bestRotation[2][1], chosenPose.bestRotation[2][2], 0,
                        0, 0, 0, 1
                    );
                    var chosenNormal = localNormal.clone().applyMatrix4(chosenRotationMatrix);
                    // Ковзне середнє для нормалі (інерція)
                    _this.lastNormalY = _this.lastNormalY * 0.7 + chosenNormal.y * 0.3;
                    
                    // --- Debug Log: вивід інформації про позу ---
                    console.log(`Marker ${_this.id}: Y=${chosenPose.bestTranslation[1].toFixed(1)}, Z=${chosenPose.bestTranslation[2].toFixed(1)}, n=${chosenNormal.y.toFixed(2)}, lastN=${_this.lastNormalY.toFixed(2)}, visible=${_this.object3d.visible}`);
                    // --- End Debug Log ---
   
                    var rotation = chosenPose.bestRotation;
                    var translation = chosenPose.bestTranslation;
                    // Конвертація мм → одиниці Three.js (1 одиниця = 1 метр)
                    var mmToUnits = 0.001; // 1 мм = 0.001 одиниць (метрів)
   
                    // --- Create rotation matrix from POSIT result ---
                    // Матриця обертання від POSIT
                    var rotationMatrix = chosenRotationMatrix;
                    
                    // --- Create the correction matrix to make the cone "stand up" ---
                    // Конус має стояти вертикально на маркері (вісь Y)
                    // Корекція: повертаємо на +90° навколо X (виправлено!)
                    var correctionMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
   
                    // Create the translation matrix (конвертація мм → метри)
                    var translationMatrix = new THREE.Matrix4();
                    translationMatrix.makeTranslation(
                        translation[0] * mmToUnits,
                        translation[1] * mmToUnits,
                        translation[2] * mmToUnits
                    );
                    
                    // Combine matrices: translation × rotation × correction
                    var poseMatrix = new THREE.Matrix4();
                    poseMatrix.multiplyMatrices(translationMatrix, rotationMatrix);
                    poseMatrix.multiply(correctionMatrix);
   
                    // Decompose the final matrix into position, quaternion, and scale.
                    _this.object3d.matrix.copy(poseMatrix);
                    _this.object3d.matrix.decompose(_this.object3d.position, _this.object3d.quaternion, _this.object3d.scale);
                    
                    // --- FIX: Інверсія кватерніона для стабільності ---
                    // Кватерніони (x,y,z,w) і (-x,-y,-z,-w) представляють однакову орієнтацію
                    // Обираємо варіант з додатнім w для стабільності
                    if (_this.object3d.quaternion.w < 0 || 
                        (_this.object3d.quaternion.w < 0.5 && _this.object3d.quaternion.x < 0)) {
                        _this.object3d.quaternion.x *= -1;
                        _this.object3d.quaternion.y *= -1;
                        _this.object3d.quaternion.z *= -1;
                        _this.object3d.quaternion.w *= -1;
                    }
                    
                    // --- Діагностика позиції ---
                    if (_this.framesLost < 2) {
                        console.log(`[Marker ${_this.id}] Position: x=${_this.object3d.position.x.toFixed(3)}, y=${_this.object3d.position.y.toFixed(3)}, z=${_this.object3d.position.z.toFixed(3)} (метри)`);
                        console.log(`[Marker ${_this.id}] Quaternion: x=${_this.object3d.quaternion.x.toFixed(2)}, y=${_this.object3d.quaternion.y.toFixed(2)}, z=${_this.object3d.quaternion.z.toFixed(2)}, w=${_this.object3d.quaternion.w.toFixed(2)}`);
                    }
                    // --- End Debug ---
            }
        } else {
            _this.framesLost++; // Increment lost frames counter
            if (_this.framesLost > _this.maxFramesLost) {
                _this.object3d.visible = false; // Hide object only after grace period
            }
            console.log(`[Marker ${_this.id}] NOT DETECTED! framesLost=${_this.framesLost}, visible=${_this.object3d.visible}`);
        }
    };
};

// Статичні змінні для спільного використання детектора та posit між усіма екземплярами контролерів.
ArucoMarkerControls.detector = null;
ArucoMarkerControls.posit = null;
