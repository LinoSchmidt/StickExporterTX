# StickExporterTX

StickExporterTX is a 3D Stick Exporter for EdgeTX/OpenTX logs.

## Controller Setup Guide

To log your sticks on each model, go to `settings -> global functions` in your RC controller.

![global-functions](readme/pictures/global-functions.bmp)

There you can select and edit one of the empty fields.
With `Switch` you select the one that should activate logging. For example, you can set your drone's arm switch to log it as long as the drone is armed.
`Func` must be set to `SD Logs` and `Value` should be as low as possible to get a smoother animation.

![function-edit](readme/pictures/function-edit.bmp)

If you only want to set up logging for one model, go to `model -> special functions` in your RC controller and repeat the previous step.

![special-functions](readme/pictures/special-functions.bmp)

## How to use
### Importing logs
1. Connect your RC controller to your computer via USB.
2. Select `USB Storage (SD)` on the controller.
3. Open the StickExporterTX app and click on `Add Log(s)`.
4. Select the log files you want to import. They should be located in the `LOGS` folder on your controller.

## How to build (for developers)
The following software is required to build the project:
- [Node.js](https://nodejs.org/)
- [Python 3](https://www.python.org/)

To build the project, run the following commands in the project directory:
```bash
npm install
npm run bundle
```
If the commands were successful, a new folder called `dist` should have been created in the project directory containing the compiled files.
## Licence:

This project is released under the MIT license, for more information, check the [LICENSE](LICENSE) file.