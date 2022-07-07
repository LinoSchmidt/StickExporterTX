import formatXML from "xml-formatter";
import {SettingPath, defaultOutputPath} from './paths';
import fs from "fs";
import logger from "./logger";

function getXMLChild(doc:Document, child:string) {
    return String(doc.getElementsByTagName(child)[0].childNodes[0].nodeValue);
}

enum VideoFormat {
    mp4="mp4",
    mov="mov",
    webm="webm",
    avi="avi",
    mkv="mkv",
}

const defaultSettings = {
    fps: 30,
    width: 540,
    stickDistance: 5,
    stickMode2: true,
    videoFormat: VideoFormat.webm,
    log: '',
    output: defaultOutputPath
}

let allSettingsFound = true;
function catchSetting(tryFunc:()=>string, catchFunc:()=>string) {
    let val;
    try {
        val = tryFunc();
    } catch(err) {
        logger.info("Failed to get setting value. Using default value:" + String(err));
        allSettingsFound = false;
        val = catchFunc();
    }
    return val;
}
const settingList = await fetch(SettingPath).then(function(response) {
    return response.text();
}).catch(function(err) {
    logger.info(err);
    return "fileLoadFailed";
}).then(function(data) {
    if(data === "fileLoadFailed") {
        allSettingsFound = false;
        return defaultSettings;
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');

    return {
        fps: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "fps");},function() {return defaultSettings.fps.toString();})),
        width: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "width");},function() {return defaultSettings.width.toString();})),
        stickDistance: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "stickDistance");},function() {return defaultSettings.stickDistance.toString();})),
        stickMode2: catchSetting(function() {return getXMLChild(xmlDoc, "stickMode2");},function() {return defaultSettings.stickMode2.toString();}) === "true",
        videoFormat: catchSetting(function() {return getXMLChild(xmlDoc, "videoFormat");},function() {return defaultSettings.videoFormat.toString();}) as VideoFormat as VideoFormat,
        log: catchSetting(function() {return (getXMLChild(xmlDoc, "log") === "None")? "":getXMLChild(xmlDoc, "log");},function() {return defaultSettings.log;}),
        output: catchSetting(function() {return getXMLChild(xmlDoc, "output");},function() {return defaultSettings.output;})
    }
});
if(!allSettingsFound) {
    updateSettings({});
}

function updateSettings(optiones:{fps?:number, width?:number, stickDistance?:number, stickMode2?:boolean, videoFormat?:VideoFormat, log?:string, output?:string}) {
    if(optiones.fps === undefined) {
        optiones.fps = settingList.fps;
    } else {
        settingList.fps = optiones.fps;
    }
    if(optiones.width === undefined) {
        optiones.width = settingList.width;
    } else {
        settingList.width = optiones.width;
    }
    if(optiones.stickDistance === undefined) {
        optiones.stickDistance = settingList.stickDistance;
    } else {
        settingList.stickDistance = optiones.stickDistance;
    }
    if(optiones.stickMode2 === undefined) {
        optiones.stickMode2 = settingList.stickMode2;
    } else {
        settingList.stickMode2 = optiones.stickMode2;
    }
    if(optiones.videoFormat === undefined) {
        optiones.videoFormat = settingList.videoFormat;
    } else {
        settingList.videoFormat = optiones.videoFormat;
    }
    if(optiones.log === undefined) {
        optiones.log = settingList.log;
    } else {
        settingList.log = optiones.log;
    }
    if(optiones.output === undefined) {
        optiones.output = settingList.output;
    } else {
        settingList.output = optiones.output;
    }
    
    const xmlStr = `
        <?xml version="1.0" encoding="UTF-8"?>
        <settings>
            <fps>${optiones.fps}</fps>
            <width>${optiones.width}</width>
            <stickDistance>${optiones.stickDistance}</stickDistance>
            <stickMode2>${optiones.stickMode2}</stickMode2>
            <videoFormat>${optiones.videoFormat}</videoFormat>
            <log>${(optiones.log === "")?"None":optiones.log}</log>
            <output>${optiones.output}</output>
        </settings>
    `;
    
    fs.writeFile(SettingPath, formatXML(xmlStr, {collapseContent: true}), function(err) {
        if(err) {
            logger.errorMSG(String(err));
        }
    });
}

function settingListLoadDefault() {
    updateSettings({
        fps:defaultSettings.fps,
        width:defaultSettings.width,
        stickDistance:defaultSettings.stickDistance,
        stickMode2:defaultSettings.stickMode2,
        videoFormat:defaultSettings.videoFormat,
    });
}

function getLogList() {
    return settingList.log.split("\"\"");
}

function getLogSize(index:number) {
    const logList = settingList.log.substring(1).slice(0, -1).split('""');
    
    return fs.statSync(logList[index]).size;
}

export {
    updateSettings,
    settingListLoadDefault,
    settingList,
    getLogList,
    getLogSize,
    VideoFormat
}