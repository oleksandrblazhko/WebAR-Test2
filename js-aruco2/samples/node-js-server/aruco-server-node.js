/*
Copyright (c) 2020 Damiano Falcioni

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var pjson = require('./package.json');
var http = require('http');
var url = require('url');
var fs = require('fs');
var jpeg = require('jpeg-js');
var AR = require('../../src/aruco').AR;

var PORT = pjson.config.port || 8081;
var SECRET = pjson.config.secret || '';
var CAMERA_WIDTH = pjson.config.cameraWidth;
var CAMERA_HEIGHT = pjson.config.cameraHeight;

var detector = new AR.Detector({
  maxHammingDistance: pjson.config.maxHammingDistance || 5,
  dictionaryName: pjson.config.dictionaryName || 'ARUCO_MIP_36h12'
});

var onMarkerDetectionHandler = function (image, markerList) {
  var jpegImageData = jpeg.encode(image, 50);
  fs.writeFile('camera_out.jpg', jpegImageData.data, function (err) {
    if (err) throw err;
  });
  if(markerList.length!=0)
    console.log(markerList);
};

var server = http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  if (pathname === '/stream' + SECRET) {
    response.connection.setTimeout(0);
    console.log('Stream connected: ' + request.socket.remoteAddress);
    detector.detectStreamInit(CAMERA_WIDTH, CAMERA_HEIGHT, onMarkerDetectionHandler);
    request.on('data', function (data) {
      //ffmpeg send data in chunk of variable length
      detector.detectStream(data);
    });
    request.on('end', function () {
      console.log('Stream disconnected');
    });
  } else if (pathname === '/camera_out.jpg') {
    var img = fs.readFileSync('camera_out.jpg');
    response.writeHead(200, {
      'Content-Type': 'image/jpg'
    });
    response.end(img, 'binary');
  } else {
    response.end();
  }
});

server.listen(PORT);

console.log('DATA INPUT: Awaiting Streams from FFMPEG on http://127.0.0.1:' + PORT + '/stream' + SECRET);
console.log('DEBUG: Output stream available on http://127.0.0.1:' + PORT + '/camera_out.jpg');
