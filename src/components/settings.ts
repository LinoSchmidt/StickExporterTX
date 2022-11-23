import {SettingPath, defaultOutputPath, OLDSettingPath} from './paths';
import logger from "./logger";
import fs from "fs";

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
    log: string,
    output: string,
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
    log: '',
    output: defaultOutputPath
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
                return defaultSettings;
            }
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
        
            return {
                activeProfile: defaultSettings.activeProfile,
                profiles: [
                    {
                        profileName: defaultSettings.profiles[0].profileName,
                        fps: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "fps");},function() {return defaultSettings.profiles[0].fps.toString();})),
                        width: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "width");},function() {return defaultSettings.profiles[0].width.toString();})),
                        stickDistance: parseInt(catchSetting(function() {return getXMLChild(xmlDoc, "stickDistance");},function() {return defaultSettings.profiles[0].stickDistance.toString();})),
                        stickMode2: catchSetting(function() {return getXMLChild(xmlDoc, "stickMode2");},function() {return defaultSettings.profiles[0].stickMode2.toString();}) === "true",
                        videoFormat: catchSetting(function() {return getXMLChild(xmlDoc, "videoFormat");},function() {return defaultSettings.profiles[0].videoFormat.toString();}) as VideoFormat as VideoFormat
                    }
                ],
                log: catchSetting(function() {return (getXMLChild(xmlDoc, "log") === "None")? "":getXMLChild(xmlDoc, "log");},function() {return defaultSettings.log;}),
                output: catchSetting(function() {return getXMLChild(xmlDoc, "output");},function() {return defaultSettings.output;})
            } as JSONSettings;
        });
    }
    
    return JSON.parse(data) as JSONSettings;
});

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

function ProfileLoadDefault(profileName?:string) {
    if(profileName === undefined) {
        profileName = getActiveProfile().profileName;
    }
    
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
            profile.fps = defaultSettings.profiles[0].fps;
            profile.width = defaultSettings.profiles[0].width;
            profile.stickDistance = defaultSettings.profiles[0].stickDistance;
            profile.stickMode2 = defaultSettings.profiles[0].stickMode2;
            profile.videoFormat = defaultSettings.profiles[0].videoFormat;
        }
    });
    
    writeSettings();
}

function editProfile(optiones:{fps?:number, width?:number, stickDistance?:number, stickMode2?:boolean, videoFormat?:VideoFormat}, profileName?:string) {
    if(profileName === undefined) {
        profileName = getActiveProfile().profileName;
    }
    
    settingList.profiles.forEach(profile => {
        if(profile.profileName === profileName) {
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

function setInOutSettings(args:{log?:string, output?:string}) {
    if(args.log !== undefined) {
        settingList.log = args.log;
    }
    if(args.output !== undefined) {
        settingList.output = args.output;
    }
    writeSettings();
}
function getInOutSettings() {
    return {log: settingList.log, output: settingList.output, logList:settingList.log.split("\"\"")};
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
        activeProfile = settingList.profiles[0];
        logger.errorMSG("Active profile not found, using default profile");
    }
    
    return activeProfile;
}

function getLogSize(index:number) {
    const logList = settingList.log.substring(1).slice(0, -1).split('""');
    
    return fs.statSync(logList[index]).size;
}

export {
    createProfile,
    ProfileLoadDefault,
    editProfile,
    removeProfile,
    setActiveProfile,
    getActiveProfile,
    setInOutSettings,
    getInOutSettings,
    getLogSize,
    VideoFormat
}