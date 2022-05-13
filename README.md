# StickExporterTX

A 3D Sticks Exporter for EdgeTX/OpenTX logs.

Setup:
------
- Lade [Blender Portable](https://www.blender.org/download) Version herunter und Entpacke es mit dem Namen `blender` in den Ordner `<Projektordner>/src/assets`.
Wenn dieser nicht existiert, erstellen sie den Ordner.
- Kopieren sie die Dateien im Ordner `<Projektordner>/src/assets` in den Ordner `%appdata%/stickexportertx/assets`.
- Starte eine Console in dem Projektordner und führe den Befehl `npm install` aus um alle notwendingen packages zu installieren.

Start:
------
Kopieren sie die Dateien im Ordner `<Projektordner>/src/assets` in den Ordner `%appdata%/stickexportertx/assets`.
Um das Programm zu starten, führe den Befehl `npm start` im Projektordner aus.

Build:
------
(Noch Nicht Funktionsfähig)
Um das Programm zu Builden, führe den Befehl `npm run package` im Projektordner aus.
Um es dann in einen EXE-Installer zu laden, öffne die Datei `installer-builder.iss` mit dem Programm [Inno Setup Compiler](https://jrsoftware.org/isdl.php#stable) und Führe das Script aus. Der Fertige installer sollte nach dem Compilen im Projektordner/output liegen.


Copyright © 2022 Lino Schmidt. All rights reserved.