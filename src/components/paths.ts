import path from 'path';
import {app} from '@electron/remote';

export const dataPath = app.getPath('userData');
export const SettingPath = path.join(dataPath, "settings.xml");

export const blenderPath = path.join("assets", "blender", "blender");
export const templatePath = path.join("assets", "template.blend");
export const blenderScriptPath = path.join("assets", "blenderScript.py");