import React from "react";
import ReactDOM from "react-dom/client";
import Menu from "./components/ui/menu";
import MainSide from "./components/ui/mainSide";
import SettingsSite from "./components/ui/settingsSide";
import RenderingSide from "./components/ui/renderingSide";
import RenderFinishSide from "./components/ui/renderFinishSide";
import "./index.css";
import "./toggle-switchy.css";
import { startBlender } from "./components/blenderController";
import {ipcRenderer} from "electron";

enum Side {
    Main,
    Rendering,
    Settings,
    RenderFinish
}

let rendering = false;
let currentSide = Side.Main;

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
function openSide(side:Side) {
    if(side == Side.Main && rendering) {
        side = Side.Rendering;
    }
    currentSide = side;
    
    root.render(
        <React.StrictMode>
            <Menu side={side}/>
            {(side === Side.Main)? <MainSide/> : null}
            {(side === Side.Settings)? <SettingsSite/> : null}
            {(side === Side.Rendering)? <RenderingSide/> : null}
            {(side === Side.RenderFinish)? <RenderFinishSide/> : null}
        </React.StrictMode>
    );
}

openSide(currentSide);

startBlender();

function sideSetRendering(value:boolean) {
    rendering = value;
    if(value) {
        if(currentSide === Side.Main) {
            openSide(Side.Rendering);
        }
    } else {
        if(currentSide === Side.Rendering) {
            openSide(Side.Main);
        }
    }
}

function setProgress(value?:number) {
    if(value === undefined) {
        ipcRenderer.send("setProgress", -1);
    } else {
        ipcRenderer.send("setProgress", value);
    }
}
        
export {
    openSide,
    Side,
    sideSetRendering,
    setProgress
}