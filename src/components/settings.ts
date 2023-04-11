import {SettingPath, defaultOutputPath, OLDSettingPath} from './paths';
import {dialog} from '@electron/remote';
import logger from "./logger";
import fs from "fs";
import {app} from 'electron';
import { ipcRenderer } from "electron";

enum VideoFormat {
    mp4="mp4",
    mov="mov",
    webm="webm",
    avi="avi",
    mkv="mkv",
}

type JSONProfile = {
    profileName: string,
    fps: number,
    width: number,
    stickDistance: number,
    stickMode2: boolean,
    videoFormat: VideoFormat
};

type JSONSettings = {
    activeProfile: string,
    profiles: JSONProfile[],
    logs: string[],
    output: string,
    showRenderTerminal: boolean
}

const defaultSettings:JSONSettings = {
    activeProfile: "Default",
    profiles: [
        {
            profileName: "Default",
            fps: 30,
            width: 540,
            stickDistance: 5,
            stickMode2: true,
            videoFormat: VideoFormat.webm
        }
    ],
    logs: [],
    output: defaultOutputPath,
    showRenderTerminal: false
};

function catchSetting(tryFunc:()=>string, catchFunc:()=>string) {
    let val;
    try {
        val = tryFunc();
    } catch(err) {
        logger.info("Failed to get setting value. Using default value:" + String(err));
        val = catchFunc();
    }
    return val;
}

function getXMLChild(doc:Document, child:string) {
    return String(doc.getElementsByTagName(child)[0].childNodes[0].nodeValue);
}

let fetchFailed = "";
const settingList = await fetch(SettingPath).then(function(response) {
    return response.text();
}).catch(function(err) {
    logger.info(err);
    return "fileLoadFailed";
}).then(async function(data) {
    if(data === "fileLoadFailed") {
        return await fetch(OLDSettingPath).then(function(response) {
            return response.text();
        }).catch(function(err) {
            logger.info(err);
            return "fileLoadFailed";
        }).then(function(data) {
            if(data === "fileLoadFailed") {
                fetchFailed = "fileLoadFailed";
                return defaultSettings;
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            
            const allLogs = catchSetting(function() {return (getXMLChild(xmlDoc, "log") === "None")? "":getXMLChild(xmlDoc, "log");},function() {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                return ""
            });
            const newLogs = defaultSettings.logs;
            if(allLogs !== "") {
                const allLogsList = allLogs.split("\"\"");
                allLogsList.forEach(log => {
                    if(log !== "") {
                        newLogs.push(log.replace('"', ''));
                    }
                });
            }
        
            return {
                activeProfile: defaultSettings.activeProfile,
                profiles: [
                    {
                        profileName: defaultSettings.profiles[0].profileName,
                        fps: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "fps");},function() {
                            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                            return defaultSettings.profiles[0].fps.toString();
                        })),
                        width: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "width");},function() {
                            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                            return defaultSettings.profiles[0].width.toString();
                        })),
                        stickDistance: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "stickDistance");},function() {
                            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                            return defaultSettings.profiles[0].stickDistance.toString();
                        })),
                        stickMode2: catchSetting(function() {return getXMLChild(xmlDoc, "stickMode2");},function() {
                            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                            return defaultSettings.profiles[0].stickMode2.toString();
                        }) === "true",
                        videoFormat: catchSetting(function() {return getXMLChild(xmlDoc, "videoFormat");},function() {
                            return defaultSettings.profiles[0].videoFormat.toString();
                        }) as VideoFormat as VideoFormat
                    }
                ],
                logs: newLogs,
                output: catchSetting(function() {return getXMLChild(xmlDoc, "output");},function() {
                    fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                    return defaultSettings.output;
                }),
                showRenderTerminal: defaultSettings.showRenderTerminal
            } as JSONSettings;
        });
    }
    const parsedData = JSON.parse(data);
    
    let profiles:JSONProfile[] = [];
    if(parsedData.profiles !== undefined) {
        parsedData.profiles.forEach((profile:JSONProfile) => {
            if(typeof profile.profileName !== "string") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.profileName = defaultSettings.profiles[0].profileName;
            }
            if(typeof profile.fps !== "number") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.fps = defaultSettings.profiles[0].fps;
            }
            if(typeof profile.width !== "number") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.width = defaultSettings.profiles[0].width;
            }
            if(typeof profile.stickDistance !== "number") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.stickDistance = defaultSettings.profiles[0].stickDistance;
            }
            if(typeof profile.stickMode2 !== "boolean") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.stickMode2 = defaultSettings.profiles[0].stickMode2;
            }
            if(typeof profile.videoFormat !== "string") {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                profile.videoFormat = defaultSettings.profiles[0].videoFormat;
            }
            
            profiles.push({
                profileName: profile.profileName,
                fps: profile.fps,
                width: profile.width,
                stickDistance: profile.stickDistance,
                stickMode2: profile.stickMode2,
                videoFormat: profile.videoFormat
            });
        });
    } else {
        fetchFailed = "multiSetting";
        profiles = defaultSettings.profiles;
    }
    
    const logs:string[] = [];
    if(parsedData.logs !== undefined) {
        parsedData.logs.forEach((log:string) => {
            if(typeof log === "string") {
                logs.push(log);
            }
        });
    } else {
        fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
    }
    
    return {
        activeProfile: catchSetting(function() {return parsedData.activeProfile;},function() {
            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
            return defaultSettings.activeProfile;
        }),
        profiles,
        logs,
        output: catchSetting(function() {return parsedData.output;},function() {
            fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
            return defaultSettings.output;
        }),
        showRenderTerminal: function() {
            if(typeof parsedData.showRenderTerminal === "boolean") {
                return parsedData.showRenderTerminal;
            } else {
                fetchFailed === "singleSetting"? fetchFailed = "multiSetting":fetchFailed = "singleSetting";
                return defaultSettings.showRenderTerminal;
            }
        }()
    }
});
if(fetchFailed !== "") {
    writeSettings();
}

function getProfiles() {
    return settingList.profiles.map((profile) => {
        return profile.profileName;
    });
}

function createProfile(profileName:string, clone:boolean) {
    settingList.profiles.push({
        profileName: profileName,
        fps: clone? getActiveProfile().fps:defaultSettings.profiles[0].fps,
        width: clone? getActiveProfile().width:defaultSettings.profiles[0].width,
        stickDistance: clone? getActiveProfile().stickDistance:defaultSettings.profiles[0].stickDistance,
        stickMode2: clone? getActiveProfile().stickMode2:defaultSettings.profiles[0].stickMode2,
        videoFormat: clone? getActiveProfile().videoFormat:defaultSettings.profiles[0].videoFormat
    });
    
    writeSettings();
}

function ProfileLoadDefault(reset:{fps?:boolean, width?:boolean, stickDistance?:boolean, stickMode2?:boolean, videoFormat?:boolean, all?:boolean}, profileName?:string) {
    if(profileName === undefined) {
        profileName = getActiveProfile().profileName;
    }
    
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
            if(reset.all || reset.fps) {
                profile.fps = defaultSettings.profiles[0].fps;
            }
            if(reset.all || reset.width) {
                profile.width = defaultSettings.profiles[0].width;
            }
            if(reset.all || reset.stickDistance) {
                profile.stickDistance = defaultSettings.profiles[0].stickDistance;
            }
            if(reset.all || reset.stickMode2) {
                profile.stickMode2 = defaultSettings.profiles[0].stickMode2;
            }
            if(reset.all || reset.videoFormat) {
                profile.videoFormat = defaultSettings.profiles[0].videoFormat;
            }
        }
    });
    
    writeSettings();
}

function editProfile(optiones:{profileName?:string, fps?:number, width?:number, stickDistance?:number, stickMode2?:boolean, videoFormat?:VideoFormat}, profileName?:string) {
    if(profileName === undefined) {
        profileName = getActiveProfile().profileName;
    }
    
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
            if(optiones.profileName !== undefined) {
                profile.profileName = optiones.profileName;
            }
            if(optiones.fps !== undefined) {
                profile.fps = optiones.fps;
            }
            if(optiones.width !== undefined) {
                profile.width = optiones.width;
            }
            if(optiones.stickDistance !== undefined) {
                profile.stickDistance = optiones.stickDistance;
            }
            if(optiones.stickMode2 !== undefined) {
                profile.stickMode2 = optiones.stickMode2;
            }
            if(optiones.videoFormat !== undefined) {
                profile.videoFormat = optiones.videoFormat;
            }
        }
    });
    
    writeSettings();
}

function setInOutSettings(args:{logs?:string[], output?:string}) {
    if(args.logs !== undefined) {
        settingList.logs = args.logs;
    }
    if(args.output !== undefined) {
        settingList.output = args.output;
    }
    writeSettings();
}
function getInOutSettings() {
    return {logs: settingList.logs, output: settingList.output};
}

function setShowRenderTerminal(show:boolean) {
    settingList.showRenderTerminal = show;
    writeSettings();
}
function getShowRenderTerminal() {
    return settingList.showRenderTerminal;
}

function removeProfile(profileName?:string) {
    if(profileName === undefined) {
        profileName = getActiveProfile().profileName;
    }
    
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
            settingList.profiles.splice(settingList.profiles.indexOf(profile), 1);
        }
    });
    
    writeSettings();
}

function setActiveProfile(profileName:string) {
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
            settingList.activeProfile = profile.profileName;
        }
    });
    
    writeSettings();
}

function writeSettings(settings?:JSONSettings) {
    if(settings === undefined) {
        settings = settingList;
    }
    
    fs.writeFile(SettingPath, JSON.stringify(settings), function(err) {
        if(err) {
            logger.errorMSG(String(err));
        }
    });
}

function getActiveProfile() {
    let activeProfile;
    settingList.profiles.forEach(profile => {
        if(profile.profileName === settingList.activeProfile) {
            activeProfile = profile;
        }
    });
    
    if(activeProfile === undefined) {
        activeProfile = defaultSettings.profiles[0];
        logger.error("Active profile not found, using default profile");
    }
    
    return activeProfile;
}

function getLogSize(index:number) {
    return fs.statSync(settingList.logs[index]).size;
}

function importProfile(importSucces:CallableFunction) {
    dialog.showOpenDialog({
        properties: [
            "openFile"
        ],
        filters: [
            {
                name: "StickExporterTX-Profile",
                extensions: [
                    "setp"
                ]
            }
        ]
    }).then(async result => {
        if(result.filePaths.length === 1) {
            const rawData = await fs.promises.readFile(result.filePaths[0], "utf8");
            const jsonData = JSON.parse(rawData) as JSONProfile[];
            const importProfiles:JSONProfile[] = [];
            jsonData.forEach(profile => {
                importProfiles.push({
                    profileName: profile.profileName,
                    fps: profile.fps,
                    width: profile.width,
                    stickDistance: profile.stickDistance,
                    stickMode2: profile.stickMode2,
                    videoFormat: profile.videoFormat
                });
            });
            
            importProfiles.forEach(importProfile => {
                while(settingList.profiles.find(profile => profile.profileName === importProfile.profileName) !== undefined) {
                    importProfile.profileName = importProfile.profileName + " (imported)";
                }
                settingList.profiles.push(importProfile);
            });
            writeSettings();
            importSucces();
        }
    }).catch(err => {
        logger.errorMSG("Import faulty: "+err);
    });
}

function exportProfile() {
    dialog.showMessageBox({
        type: "question",
        noLink: true,
        buttons: ["This", "All", "Cancel"],
        title: "Export profile",
        message: "Do you want to export all profiles or just the active one?"
    }).then(result => {
        if(result.response === 0) {
            dialog.showSaveDialog({
                filters: [
                    {
                        name: "StickExporterTX-Profile",
                        extensions: [
                            "setp"
                        ]
                    }
                ]
            }).then(result => {
                if(result.filePath !== undefined) {
                    fs.writeFile(result.filePath, JSON.stringify([getActiveProfile()]), function(err) {
                        if(err) {
                            logger.errorMSG(String(err));
                        }
                    });
                }
            }).catch(err => {
                logger.errorMSG("Export faulty: "+err);
            });
        }
        else if(result.response === 1) {
            dialog.showSaveDialog({
                filters: [
                    {
                        name: "StickExporterTX-Profile",
                        extensions: [
                            "setp"
                        ]
                    }
                ]
            }).then(result => {
                if(result.filePath !== undefined) {
                    fs.writeFile(result.filePath, JSON.stringify(settingList.profiles), function(err) {
                        if(err) {
                            logger.errorMSG(String(err));
                        }
                    });
                }
            }).catch(err => {
                logger.errorMSG("Export faulty: "+err);
            });
        }
    }).catch(err => {
        logger.errorMSG("Export faulty: "+err);
    });
}

export {
    getProfiles,
    createProfile,
    ProfileLoadDefault,
    editProfile,
    removeProfile,
    setActiveProfile,
    getActiveProfile,
    setInOutSettings,
    getInOutSettings,
    setShowRenderTerminal,
    getShowRenderTerminal,
    getLogSize,
    importProfile,
    exportProfile,
    VideoFormat
}