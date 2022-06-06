import {blenderPath, blenderScriptPath, SettingPath, templatePath} from "./paths";
import {exec} from "child_process";
import logger from "./logger";
import React from "react";

function Render(setStatusDisplay:React.Dispatch<React.SetStateAction<string>>, setLogNumber:React.Dispatch<React.SetStateAction<string>>) {
    const blenderCons = exec('"' + blenderPath + '" "' + templatePath + '" --background --python "' + blenderScriptPath + '" -- "' + SettingPath.replaceAll('\\', '/') + '"', {maxBuffer: Infinity});
    
    let frames = "0";
    let lastFrame = "0";
    let lastData = "Initializing...";
    
    setStatusDisplay(lastData);
    
    blenderCons.stdout?.on("data", (data:string) => {
        logger.info(data);
        
        if(data.startsWith("Frames:")) {
            frames = data.split(":")[1];
        } else if(data.startsWith("Fra:")) {
            lastFrame = data.split(":")[1].split(" ")[0]
            lastData = "Render Frame " + lastFrame + "/" + frames;
        } else if(data.startsWith("Finished")) {
            if(lastFrame == frames) {
                lastData = "Finished Render Successfully!"
            } else {
                logger.errorMSG("Render Failed!");
            }
        } else if(data.includes("Blender quit")) {
            if(lastData != "Finished Render Successfully!") {
                logger.errorMSG("Render Failed!");
            }
        } else if(data.startsWith("Init:")) {
            lastData = "Initialize Frame " + data.split(":")[1] + "/" + frames;
        } else if(data.startsWith("Lognr:")) {
            setLogNumber(data.split(":")[1]);
        }
        
        setStatusDisplay(lastData);
    });
}

export default Render;