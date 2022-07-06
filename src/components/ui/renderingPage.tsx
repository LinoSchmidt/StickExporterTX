import React, {useEffect, useState} from "react";
import { settingList, getLogList } from "../settings";
import openFolder from "../openFolder";
import { blenderCmd, blender } from "../blenderController";

let setLogNumber:React.Dispatch<React.SetStateAction<string>>;
let setStatus:React.Dispatch<React.SetStateAction<string>>;
let setRenderDisplayProgress:React.Dispatch<React.SetStateAction<number>>;
let setPastTime:React.Dispatch<React.SetStateAction<string>>;
let setRemainingTime:React.Dispatch<React.SetStateAction<string>>;

let pastTimeNow = "0m 0s";
let remainingTimeNow = "calculating...";

function RenderingPage() {
    const [logNumber, setLogNumberInner] = useState("0");
    setLogNumber = setLogNumberInner;
    const [status, setStatusInner] = useState("Idle");
    setStatus = setStatusInner;
    const [renderDisplayProgress, setRenderDisplayProgressInner] = useState(0);
    setRenderDisplayProgress = setRenderDisplayProgressInner;
    const [pastTime, setPastTimeInner] = useState("0m 0s");
    setPastTime = setPastTimeInner;
    const [remainingTime, setRemainingTimeInner] = useState("calculating...");
    setRemainingTime = setRemainingTimeInner;
    
    useEffect(() => {
        const interval = setInterval(() => {
            setPastTime(pastTimeNow);
            setRemainingTime(remainingTimeNow);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
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
            <div style={
                {
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "5px",
                    marginBottom: "10px"
                }
            }>
                <h4 style={{margin: "0"}}>Past Time:</h4>
                <p style={
                    {
                        margin: "0",
                        marginRight: "auto",
                        marginLeft: "10px",
                        display: "flex",
                        width: "auto"
                    }
                }>{pastTime}</p>
                <h4 style={{margin: "0"}}>Remaining Time:</h4>
                <p style={
                    {
                        margin: "0",
                        marginLeft: "10px"
                    }
                }>{remainingTime}</p>
            </div>
            <button id="stopRenderButton" onClick={() => blender(blenderCmd.stopRendering)}>Stop</button>
            <button onClick={() => openFolder(settingList.output)}>Open Output Folder</button>
        </div>
    )
}

function setPastTimeNow(time:string) {
    pastTimeNow = time;
}

function setRemainingTimeNow(time:string) {
    remainingTimeNow = time;
}

export default RenderingPage;
export {
    setLogNumber,
    setStatus,
    setRenderDisplayProgress,
    setPastTime,
    setRemainingTime,
    setPastTimeNow,
    setRemainingTimeNow
};