import React, {useState, useEffect} from "react";
import { dialog } from "@electron/remote";
import { settingList, updateSettings } from "../settings";
import logger from "../logger";
import {exec} from "child_process";
import Render from "../render";

function MainSide() {
    const [status, setStatus] = useState("Idle");
    const [logNumber, setLogNumber] = useState("0");
    const [logs, setLogs] = useState(settingList.log);
    const [output, setOutput] = useState(settingList.output);
    const [logTable, setLogTable] = useState(logs.substring(1).slice(0, -1).split('""').map((log, index) => {
        return <tr key={index}>
            <td>{log}</td>
        </tr>
    }));
    useEffect(() => {
        setLogTable(logs.substring(1).slice(0, -1).split('""').map((log, index) => {
            return <tr key={index}>
                <td>{log}</td>
            </tr>
        }));
    }, [logs]);
    
    return (
        <div id="content">
            <button onClick={() => Render(setStatus, setLogNumber)}>Start Render</button>
            <p>{"Log " + logNumber + "/" + String(settingList.log.split("\"\"").length)}</p>
            <div className="dataDiv">
                <p>{status}</p>
                <button onClick={() => openOutputFolder()}>Open Output Folder</button>
            </div>
            <hr/>
            <div className="dataDiv">
                <p>Logs:</p>
                <table>
                    <tbody>
                        {logTable}
                    </tbody>
                </table>
                <button onClick={() => openLog(setLogs)}>Open Log</button>
            </div>
            <div className="dataDiv">
                <p id="output">{"Output Folder: " + output}</p>
                <button onClick={() => openVid(setOutput)}>Open Video</button>
            </div>
        </div>
    )
}

function openLog(updateHook:React.Dispatch<React.SetStateAction<string>>) {
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
            logStr += "\"" + String(value) + "\"";
        });
        updateSettings({log:logStr});
        updateHook(logStr);
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