import React, {useState, useEffect} from "react";
import { dialog } from "@electron/remote";
import { settingList, updateSettings } from "../settings";
import logger from "../logger";
import {exec} from "child_process";
import {blender, blenderCmd} from "../blender-controller";

let setStatus:React.Dispatch<React.SetStateAction<string>>;
let setLogNumber:React.Dispatch<React.SetStateAction<string>>;

function MainSide() {
    const [status, setStatusInner] = useState("Idle");
    setStatus = setStatusInner;
    const [logNumber, setLogNumberInner] = useState("0");
    setLogNumber = setLogNumberInner;
    const [logs, setLogs] = useState(settingList.log);
    const [output, setOutput] = useState(settingList.output);
    const [logTable, setLogTable] = useState(logs.substring(1).slice(0, -1).split('""').map((log, index) => {
        return <tr key={index}>
            <td>{log}</td>
        </tr>
    }));
    useEffect(() => {
        const logList = settingList.log.substring(1).slice(0, -1).split('""');
        
        const logListName:string[] = [];
        logList.forEach(log => {
            logListName.push(log.split('\\')[log.split('\\').length - 1]);
        });
        
        setLogTable(logListName.map((log, index) => {
            return <tr key={index}>
                <td title={logList[index]}>{index+1}. {log}</td>
                <td><button onClick={() => {
                    const newLogs = settingList.log.replace('"'+logList[index]+'"', "");
                    updateSettings({log:newLogs});
                    setLogs(newLogs);
                }}>Delete</button></td>
            </tr>
        }));
    }, [logs]);
    
    return (
        <div id="content">
            <button id="start-render" onClick={() => blender(blenderCmd.startRendering)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {/* <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/>
                </svg>
            </button>
            <p>{"Log " + logNumber + "/" + String(settingList.log.split("\"\"").length)}</p>
            <div className="dataDiv">
                <p>{status}</p>
                <button onClick={() => openOutputFolder()}>Open Output Folder</button>
            </div>
            <hr/>
            <h4 className="noMarginBottom">Logs:</h4>
            <table>
                <tbody>
                    {logTable}
                </tbody>
            </table>
            <div className="dataDiv">
                <button id="openLogButton" onClick={() => addLog(setLogs)}>Add Log(s)</button>
                <button id="deleteLogsButton" onClick={() => {
                    updateSettings({log:""});
                    setLogs("");
                }}>Delete All</button>
            </div>
            <div className="dataDiv" id="outputDiv">
                <h4>Output Folder:</h4>
                <p id="output">{output}</p>
                <button onClick={() => openVid(setOutput)}>Open Video</button>
            </div>
        </div>
    )
}

function addLog(updateHook:React.Dispatch<React.SetStateAction<string>>) {
    dialog.showOpenDialog({
        properties: [
            "multiSelections"
        ],
        filters: [
            {
                name: "TX-Logs",
                extensions: [
                    "csv"
                ]
            }
        ]
    }).then(result => {
        let logStr = "";
        result.filePaths.forEach(value => {
            const logToAdd = "\"" + value + "\"";
            if(settingList.log.includes(logToAdd)) {
                logger.warningMSG("Log already added!");
            } else {
                logStr += "\"" + String(value) + "\"";
            }
        });
        const newLogs = settingList.log + logStr;
        updateSettings({log:newLogs});
        updateHook(newLogs);
    }).catch(err => {
        logger.errorMSG(err);
    });
}

function openVid(updateHook:React.Dispatch<React.SetStateAction<string>>) {
    dialog.showOpenDialog({
        properties: [
            "openDirectory"
        ]
    }).then(result => {
        updateSettings({output:String(result.filePaths)});
        updateHook(String(result.filePaths));
    }).catch(err => {
        logger.errorMSG(err);
    });
}

function openOutputFolder() {
    if(settingList.output == "None") {
        logger.warningMSG("No output folder set!");
    } else {
        exec('start "" "' + settingList.output + '"');
    }
}

export default MainSide;
export {
    setStatus,
    setLogNumber
}