import React, {useState} from "react";
import { settingList } from "../settings";
import {openOutputFolder} from "./mainSide";

let setLogNumber:React.Dispatch<React.SetStateAction<string>>;
let setStatus:React.Dispatch<React.SetStateAction<string>>;

function RenderingSide() {
    const [logNumber, setLogNumberInner] = useState("0");
    setLogNumber = setLogNumberInner;
    const [status, setStatusInner] = useState("Idle");
    setStatus = setStatusInner;
    
    return (
        <div id="content">
            <p>{"Log " + logNumber + "/" + String(settingList.log.split("\"\"").length)}</p>
            <p>{status}</p>
            <button onClick={() => openOutputFolder()}>Open Output Folder</button>
        </div>
    )
}

export default RenderingSide;
export {
    setLogNumber,
    setStatus
};