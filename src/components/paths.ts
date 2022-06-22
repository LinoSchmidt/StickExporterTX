import path from 'path';
import {app} from '@electron/remote';
import { platformFolder, platform, Platform } from './platform';

export const dataPath = app.getPath('userData');
export const appPath = app.getAppPath().replace("app.asar", "");
export const SettingPath = path.join(dataPath, "settings.xml");

export const defaultOutputPath = path.join(app.getPath('videos'), "StickExporterTX");

export function platformCharacter() {
    let platformCharacterTEMP = "/";
    if (platform === Platform.Windows) {
        platformCharacterTEMP = "\\";
    }
    return platformCharacterTEMP;
}

export const blenderPath = path.join(appPath, "dependencies", platformFolder, "blender", "blender");
export const templatePath = path.join(appPath, "dependencies", "template.blend");
export const blenderScriptPath = path.join(appPath, "dependencies", "blenderScript.py");