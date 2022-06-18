import path from 'path';
import {app} from '@electron/remote';

export const dataPath = app.getPath('userData');
export const appPath = app.getAppPath().replace("app.asar", "");
export const SettingPath = path.join(dataPath, "settings.xml");

export const defaultOutputPath = path.join(app.getPath('videos'), "StickExporterTX");

let platformFolder = "";
if(process.platform === "win32") {
    platformFolder = "windows";
} else if(process.platform === "darwin") {
    platformFolder = "darwin";
} else if(process.platform === "linux") {
    platformFolder = "linux";
}

export function platformCharacter() {
    let platformCharacterTEMP = "/";
    if (process.platform === "win32") {
        platformCharacterTEMP = "\\";
    }
    return platformCharacterTEMP;
}

export const blenderPath = path.join(appPath, "dependencies", platformFolder, "blender", "blender");
export const templatePath = path.join(appPath, "dependencies", "template.blend");
export const blenderScriptPath = path.join(appPath, "dependencies", "blenderScript.py");