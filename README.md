# StickExporterTX

A 3D Sticks Exporter for EdgeTX/OpenTX logs.

## Setup:
- Download [Blender (Portable)](https://www.blender.org/download) and unpack it with the name `blender` in the folder `<Project folder>/assets`.
- Start a console in the project folder and execute the command `npm install` to install the necessary packages.

## Test:
To test the program, execute the command `npm start` in the project folder.

## Build:

### Windows:
To build the program, execute the command `npm run package-win` in the project folder.
After that, open the file `installer-builder.iss` with the program [Inno Setup Compiler](https://jrsoftware.org/isdl.php#stable) and compile it.
The finished installer should be inside `<Project Folder>/output`.

## Licence:
This project is released under the MIT license, for more information, check the [LICENSE](LICENSE.md) file.
