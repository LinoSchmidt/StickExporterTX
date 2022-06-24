import React, {useState} from "react";
import { settingList, getLogList } from "../settings";
import openFolder from "../openFolder";
import { blenderCmd, blender } from "../blender-controller";

let setLogNumber:React.Dispatch<React.SetStateAction<string>>;
let setStatus:React.Dispatch<React.SetStateAction<string>>;
let setRenderDisplayProgress:React.Dispatch<React.SetStateAction<number>>;

function RenderingSide() {
    const [logNumber, setLogNumberInner] = useState("0");
    setLogNumber = setLogNumberInner;
    const [status, setStatusInner] = useState("Idle");
    setStatus = setStatusInner;
    const [renderDisplayProgress, setRenderDisplayProgressInner] = useState(0);
    setRenderDisplayProgress = setRenderDisplayProgressInner;
    
    return (
        <div id="content">
            <p>{"Log " + logNumber + "/" + getLogList().length}</p>
            <p>{status}</p>
            <div className="progress">
                <div className="progress-done" style={{
                    width: renderDisplayProgress + "%"
                }}></div>
                <label>{renderDisplayProgress}%</label>
            </div>
            <button id="stopRenderButton" onClick={() => blender(blenderCmd.stopRendering)}>Stop</button>
            <button onClick={() => openFolder(settingList.output)}>Open Output Folder</button>
        </div>
    )
}

export default RenderingSide;
export {
    setLogNumber,
    setStatus,
    setRenderDisplayProgress
};