# JS-ARUCO2 sample on NodeJS

This sample demonstrate how to use [js-aruco2](https://github.com/damianofalcioni/js-aruco2) in a NodeJS application to detect markers on a video stream generated with [FFMPEG](https://ffmpeg.org).

## Requirements
- FFMPEG installed or `ffmpeg` executable available in this folder
- NodeJS + NPM

## Configuration

- Configure your camera input editing the `config.camera`, `config.cameraWidth` and `config.cameraHeight` parameters in the `package.json` (instructions for setting the camera on different OS are available in the `package.json`).

- Optionally configure the server port (default `8081`) editing the `config.port` attribute.

- Optionally change the endpoint secret editing the `config.secret` attribute, in order to avoid stream hijacking if deployed on centralized server.

- Optionally change the ArUco markers dictionary used editing the `config.dictionaryName` attribute (default `ARUCO_MIP_36h12`). Available values are `ARUCO_MIP_36h12` and `ARUCO`.

- Optionally change the default hamming distance of the selected dictionary editing the `config.maxHammingDistance` attribute.

## Getting started
1) Initialize the project:
    ```
    npm run init
    ```
2) Start the server:
    ```
    npm run server
    ```
3) Start the FFMPEG stream of your camera:
    - For Window based OS:
      ```
      npm run stream_win
      ```
    - For Linux based OS:
      ```
      npm run stream_unix
      ```
    - For MacOS based OS:
      ```
      npm run stream_osx
      ```
4) The recognized markers are visualized in the console. Additionally (mainly for testing purposes) the last processed image will be continously saved as JPEG in this folder with name `camera_out.jpg`

## Notes

- In order to avoid frames dropping and not overload the system, `ffmpeg` will send 1 frame per second to the server.