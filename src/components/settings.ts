import formatXML from "xml-formatter";
import {SettingPath} from './paths';
import fs from "fs";
import logger from "./logger";

function getXMLChild(doc:Document, child:string) {
    return String(doc.getElementsByTagName(child)[0].childNodes[0].nodeValue);
}

const settingList = await fetch(SettingPath).then(function(response){
    return response.text();
}).then(function(data){
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    
    return {
        fps: parseInt(getXMLChild(xmlDoc, "fps")),
        width: parseInt(getXMLChild(xmlDoc, "width")),
        stickDistance: parseInt(getXMLChild(xmlDoc, "stickDistance")),
        stickMode2: (getXMLChild(xmlDoc, "stickMode2") === "true"),
        log: getXMLChild(xmlDoc, "log"),
        output: getXMLChild(xmlDoc, "output")
    }
    
}).catch(function(error) {
    logger.errorMSG(error);
    
    return {
        fps: 30,
        width: 540,
        stickDistance: 5,
        stickMode2: true,
        log: '"None"',
        output: "None"
    }
});

function settingListLoadDefault() {
    updateSettings({
        fps: 30,
        width: 540,
        stickDistance: 5,
        stickMode2: true
    });
}

function updateSettings(optiones:{fps?:number, width?:number, stickDistance?:number, stickMode2?:boolean, log?:string, output?:string}) {
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
    
    const xmlStr = '<?xml version="1.0"?><settings><fps>' + optiones.fps +
        '</fps><width>' + optiones.width +
        '</width><stickDistance>' + optiones.stickDistance +
        '</stickDistance><stickMode2>' + ((optiones.stickMode2)?"true":"false") +
        '</stickMode2><log>' + optiones.log +
        '</log><output>' + optiones.output +
        '</output></settings>';
    
    fs.writeFile(SettingPath, formatXML(xmlStr, {collapseContent: true}), function(err) {
        if(err) {
            logger.errorMSG(String(err));
        }
    });
}

export {
    updateSettings,
    settingListLoadDefault,
    settingList
}