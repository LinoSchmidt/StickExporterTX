import React, {useEffect, useState} from "react";
import { dialog } from "@electron/remote";
import { setInOutSettings, getInOutSettings } from "../settings";
import logger from "../logger";
import {blender, blenderCmd} from "../blenderController";
import openFolder from "../openFolder";
import {platformCharacter} from "../paths";
import {logList, reloadAllLogs, updateLogs} from "../logReader";

function MainPage() {
    const [output, setOutput] = useState(getInOutSettings().output);
    const [logTable, setLogTable] = useState([<tr key={0}></tr>]);
    
    useEffect(() => {
        updateLogTable(setLogTable);
    }, []);
    
    return (
        <div id="content">
            <button id="start-render" onClick={() => blender(blenderCmd.startRendering)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {/* <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/>
                </svg>
            </button>
            <h4 className="noMarginBottom">Logs:</h4>
            <table>
                <tbody>
                    {logTable}
                </tbody>
            </table>
            <div className="dataDiv">
                <button id="openLogButton" onClick={() => addLog(setLogTable)}>Add Log(s)</button>
                <button id="deleteLogsButton" onClick={async () => {
                    setInOutSettings({logs:[]});
                    await reloadAllLogs();
                    updateLogTable(setLogTable);
                }}>Delete All</button>
            </div>
            <div className="dataDiv" id="outputDiv">
                <h4>Output Folder:</h4>
                <p id="output" onClick={() => openFolder(getInOutSettings().output)}>{output}</p>
                <button onClick={() => openVid(setOutput)}>Select Folder</button>
            </div>
        </div>
    )
}

function updateLogTable(setLogTable:React.Dispatch<React.SetStateAction<JSX.Element[]>>) {
    function getData() {
        setLogTable(logList.map((log, index) => {
            return <tr key={index}>
                <td style={{
                    fontWeight: "bold",
                    fontStyle: "italic"
                }}>{index+1}.</td>
                <td id="logList-Name" title={log.path+"\n"+log.time.start.formatted+"\n"+log.time.length.formatted} onClick={() => openFolder(log.path.substring(0, log.path.lastIndexOf(platformCharacter())))}>{log.name}</td>
                <td style={{
                    fontStyle: "italic",
                    fontWeight: "lighter"
                }}>({log.time.length.formatted})</td>
                <td><button className="listButton" onClick={async () => {
                    const newLogs = getInOutSettings().logs.filter(value => value !== log.path);
                    setInOutSettings({logs:newLogs});
                    await updateLogs();
                    updateLogTable(setLogTable);
                }}>Delete</button></td>
            </tr>
        }));
    }
    
    if(getInOutSettings().logs.length === 0) {
        setLogTable([]);
    } else {
        getData();
    }
}

function addLog(setLogTable:React.Dispatch<React.SetStateAction<JSX.Element[]>>) {
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
    }).then(async result => {
        const newLogs = getInOutSettings().logs;
        result.filePaths.forEach(value => {
            if(getInOutSettings().logs.includes(value)) {
                logger.warningMSG("Log \"" + value + "\" already added.");
            } else {
                newLogs.push(value);
            }
        });
        setInOutSettings({logs:newLogs});
        await updateLogs();
        updateLogTable(setLogTable);
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
        if(result.filePaths.length > 0) {
            setInOutSettings({output:String(result.filePaths)});
            updateHook(String(result.filePaths));
        }
    }).catch(err => {
        logger.errorMSG(err);
    });
}

export default MainPage;