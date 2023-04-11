import React, {useEffect, useRef, useState} from "react";
import {getInOutSettings, getShowRenderTerminal, setShowRenderTerminal} from "../settings";
import openFolder from "../openFolder";
import { blenderCmd, blender } from "../blenderController";

let setLogNumber:React.Dispatch<React.SetStateAction<string>>;
let setStatus:React.Dispatch<React.SetStateAction<string>>;
let setRenderDisplayProgress:React.Dispatch<React.SetStateAction<number>>;
let setPastTime:React.Dispatch<React.SetStateAction<string>>;
let setRemainingTime:React.Dispatch<React.SetStateAction<string>>;
let setTerminalLines:React.Dispatch<React.SetStateAction<JSX.Element[]>>;

let pastTimeNow = "0m 0s";
let remainingTimeNow = "calculating...";

function RenderingPage() {
    const [terminalHidden, setTerminalHidden] = useState(getShowRenderTerminal() ? "block" : "none");
    const [terminalScroll, setTerminalScroll] = useState(true);
    const [scrollButtonText, setScrollButtonText] = useState("pause scroll");
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
    const [terminalLines, setTerminalLinesInner] = useState([
        <tr key={0}>
            <td className="terminalTableNumber">0:</td>
            <td>==== Start ====</td>
        </tr>
    ]);
    setTerminalLines = setTerminalLinesInner;
    
    const messagesEndRef = useRef() as React.MutableRefObject<HTMLDivElement>;
    
    useEffect(() => {
        if(terminalScroll) {
            messagesEndRef.current?.scrollIntoView();
            setScrollButtonText("pause scroll");
        } else {
            setScrollButtonText("continue scroll");
        }
    }, [terminalLines, messagesEndRef, terminalScroll]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setPastTime(pastTimeNow);
            setRemainingTime(remainingTimeNow);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div id="content">
            <p>{"Log " + logNumber + "/" + getInOutSettings().logs.length}</p>
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
            <button onClick={() => openFolder(getInOutSettings().output)}>Open Output Folder</button>
            <button onClick={() => {
                if (getShowRenderTerminal()) {
                    setTerminalHidden("none");
                    setShowRenderTerminal(false);
                } else {
                    setTerminalHidden("block");
                    setShowRenderTerminal(true);
                }
            }} style={{marginLeft:"10px"}}>Details</button>
            <div style={{display: terminalHidden}}>
                <div id="outerTerminal">
                    <div id="innerTerminal">
                        <table id="terminalTable">
                            {terminalLines}
                        </table>
                        <div ref={messagesEndRef}/>
                    </div>
                </div>
                <button style={{padding:"4px"}} onClick={() => setTerminalScroll(!terminalScroll)}>{scrollButtonText}</button>
            </div>
        </div>
    )
}

function setPastTimeNow(time:string) {
    pastTimeNow = time;
}

function setRemainingTimeNow(time:string) {
    remainingTimeNow = time;
}

function addTerminalLine(line:string) {
    setTerminalLines((prev:JSX.Element[]) => {
        return [...prev,
            <tr key={prev.length}>
                <td className="terminalTableNumber">{prev.length}:</td>
                <td>{line}</td>
            </tr>
        ];
    });
}

export default RenderingPage;
export {
    setLogNumber,
    setStatus,
    setRenderDisplayProgress,
    setPastTime,
    setRemainingTime,
    setPastTimeNow,
    setRemainingTimeNow,
    addTerminalLine
};