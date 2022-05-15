# StickExporterTX

A 3D Sticks Exporter for EdgeTX/OpenTX logs.

Setup:
------
- Lade [Blender Portable](https://www.blender.org/download) Version herunter und Entpacke es mit dem Namen `blender` in den Ordner `<Projektordner>/assets`.
- Starte eine Console in dem Projektordner und führe den Befehl `npm install` aus um alle notwendingen packages zu installieren.

Start:
------
Um das Programm zu starten, führe den Befehl `npm start` im Projektordner aus.

Build Windows:
------
Um das Programm zu Builden, führe den Befehl `npm run package-win` im Projektordner aus.
Öffne die Datei `installer-builder.iss` mit dem Programm [Inno Setup Compiler](https://jrsoftware.org/isdl.php#stable) und Compile das Programm.
Der Fertige installer sollte nach dem Compilen in `<Projektordner>/output` landen.


Copyright © 2022 Lino Schmidt. All rights reserved.