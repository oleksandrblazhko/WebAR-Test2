# JS-ARUCO2

**js-aruco2** is a fork of [js-aruco](https://github.com/jcmellado/js-aruco) that supports also the ARUCO_MIP_36h12 dictionary and any other ArUco or custom dictionary for square markers. Additionally, this library is ready to be used in NodeJS to recognize markers from FFMPEG video streams and allows to generate markers in SVG format.

**js-aruco2** is a pure Javascript implementation of [ArUco](https://www.uco.es/investiga/grupos/ava/portfolio/aruco/), a minimal library for Augmented Reality applications based on OpenCv.


## Demos

100% client side JavaScript, running in your browser (see details below):

- [Webcam live demo! (ARUCO Dictionary)](https://damianofalcioni.github.io/js-aruco2/samples/getusermedia/getusermedia_ARUCO.html)

- [Webcam live demo! (ARUCO_MIP_36h12 Dictionary)](https://damianofalcioni.github.io/js-aruco2/samples/getusermedia/getusermedia_ARUCO_MIP_36h12.html)

- [Visual debugging live demo (ARUCO_MIP_36h12 Dictionary)!](https://damianofalcioni.github.io/js-aruco2/samples/debug/debug.html)

- [3D Earth (ARUCO_MIP_36h12 Dictionary)!](https://damianofalcioni.github.io/js-aruco2/samples/debug-posit/debug-posit.html)

- [Markers Creator](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html)

## Markers 

A square grid with an external unused black border. Internal cells contains id information.

The markes are recognized using the dictionary specified. The library currently support the following dictionaries:
- ARUCO: 7x7 Marker with 25 bit information, minimum hamming distance between any two codes = 3 and 1023 codes. [Create ARUCO Markers](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html?dictionary=ARUCO).
- [ARUCO_MIP_36h12](https://sourceforge.net/projects/aruco/files/aruco_mip_36h12_dict.zip/download): 8x8 Marker with 36 bit information, minimum hamming distance between any two codes = 12 and 250 codes. [Create ARUCO_MIP_36h12 Markers](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html?dictionary=ARUCO_MIP_36h12).

- AprilTag, ARTag, ARToolkitPlus, ChiliTags, and other ArUco additionals dictionaries are available in the [dictionaries folder](./src/dictionaries/).

The library can be anyway easily adapted to work with any other ArUco dictionary for square markers. 

## Usage
Create an `AR.Detector` object using default ARUCO_MIP_36h12 dictionary:

```
var detector = new AR.Detector();
```
Create an `AR.Detector` object using a specific dictionary (dictionaries available out of the box in the library are 'ARUCO' and 'ARUCO_MIP_36h12'):

```
var detector = new AR.Detector({
  dictionaryName: 'ARUCO'
});
```

Additionally, is possible to specify a custom hamming distance for the specified dictionary:

```
var detector = new AR.Detector({
  dictionaryName: 'ARUCO_MIP_36h12',
  maxHammingDistance: 5
});
```

In the previous sample, the default maximum allowed hamming distance of the dictionary ARUCO_MIP_36h12 (that is 12) is replaced with 5. Doing so will be identified only markers with a detection error below 5, making the detection more reliable in case of high resolution images, at the cost of skipping possibles relevant markers in low resolution images.

### Markers detection on Canvas images
Call `detect` function with imageData parameter:

```
var markers = detector.detect(imageData);
```

`markers` result will be an array of `AR.Marker` objects with detected markers.

`AR.Marker` objects have two properties:

 * `id`: Marker id.
 * `corners`: 2D marker corners.

`imageData` argument must be a valid `ImageData` canvas object.

```
var canvas = document.getElementById("canvas");
    
var context = canvas.getContext("2d");

var imageData = context.getImageData(0, 0, width, height);
```

### Markers detection on RGBA Raw images
Call `detect` function with width, height and data parameters:

```
var markers = detector.detect(width, height, data);
```
`width` and `height` must be integer numbers representing the image size.
`data` must be an 8-bit unsigned `ArrayBuffer` (eg. `Uint8ClampedArray`) containing the sequence of RGBA image bytes (R, G, B, A, R, G, B, A, R, G, B, A, ....).


### Markers detection on RGBA video stream
Initialize the stream detection calling the `detectStreamInit` function with width, height and callback parameters:

```
detector.detectStreamInit(width, height, callback);
```
`width` and `height` must be integer numbers representing the size of video image.
`callback` must be a function that accept two parameters: the first is the image processed and the second the markers list detected

```
var callback = function (image, markerList) {
  console.log(markerList);
};
```

The callback function will be called every time an image in the video stream is processed, providing the markers detection results.

After this initialization phase, the function detectStream must be called every time a video chunk is available (the function accept chunks of every size):

```
detector.detectStream(data);
```
`data` must be an 8-bit unsigned `ArrayBuffer` (eg. `Uint8ClampedArray`) containing a video chunk as sequence of RGBA image bytes (R, G, B, A, R, G, B, A, R, G, B, A, ....). 


## Markers Detection in NodeJS 
An example of server side detection in NodeJS using stream data from FFMPEG stream is available in the [samples/node-js-server](./samples/node-js-server) folder.


## Creation of Custom Dictionaries
Custom dictionaries can be added to the library, editing the AR.DICTIONARIES before the instansiation of the ArUco Detector:

```
//example of custom dictionary
AR.DICTIONARIES.MyDictionary = {
  nBits: 25,
  tau: 1,
  codeList: ['0x1084210UL', '0x1084217UL', ...]
};
```
`nBits` must contain the bit dimension of the markers in your dictionary.
`tau` can contain the hamming distance of the codes in your dictionary (optional).
`codeList` must be an array of strings containing the hexadecimal representation of every marker in your dictionary. The order is important because the position in the array represents the marker id.

The defined dictionary is then available to the detector:

```
var detector = new AR.Detector({
  dictionaryName: 'MyDictionary'
});
```

## Creation of Marker SVG image
Create a `AR.Dictionary` object providing as parameter the dictionary name to use (currently available dictionaries are 'ARUCO' and 'ARUCO_MIP_36h12') and then call the function `generateSVG` providing as parameter the id to generate (that is a number between 0 and the size-1 of the `codeList` array in the specified dictionary):
```
var dictionary = new AR.Dictionary('ARUCO');
var SVG = dictionary.generateSVG(0);
```
A [sample page](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html) is available to show this feature.

## 3D Pose Estimation
Create an `POS.Posit` object:

```
var posit = new POS.Posit(modelSize, canvas.width);
```

`modelSize` argument must be the real marker size (millimeters).

Call `pose` function:

```
var pose = posit.pose(corners);
```

`corners` must be centered on canvas:

```
var corners = marker.corners;

for (var i = 0; i < corners.length; ++ i){
  var corner = corners[i];

  corner.x = corner.x - (canvas.width / 2);
  corner.y = (canvas.height / 2) - corner.y;
}
```

`pose` result will be a `POS.Pose` object with two estimated poses (if any):

 * `bestError`: Error of the best estimated pose.
 * `bestRotation`: 3x3 rotation matrix of the best estimated pose.
 * `bestTranslation`: Translation vector of the best estimated pose.
 * `alternativeError`: Error of the alternative estimated pose.
 * `alternativeRotation`: 3x3 rotation matrix of the alternative estimated pose.
 * `alternativeTranslation`: Translation vector of the alternative estimated pose.

Note: POS namespace can be taken from posit1.js or posit2.js.

## Support Me <3
[![Buy me a coffee](https://user-images.githubusercontent.com/8982949/109154198-40129680-776e-11eb-8015-67da5a4c78d1.png)](https://www.paypal.me/damianofalcioni/0.99)
