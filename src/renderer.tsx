import React from "react";
import ReactDOM from "react-dom/client";
import Menu from "./components/ui/menu";
import MainSide from "./components/ui/mainSide";
import SettingsSite from "./components/ui/settingsSide";
import RenderingSide from "./components/ui/renderingSide";
import "./index.css";
import "./toggle-switchy.css";
import { startBlender } from "./components/blender-controller";

enum Side {
    Main,
    Rendering,
    Settings
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
            <Menu updateAvailable={false} side={side}/>
            {(side === Side.Main)? <MainSide/> : null}
            {(side === Side.Settings)? <SettingsSite/> : null}
            {(side === Side.Rendering)? <RenderingSide/> : null}
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
        
export {
    openSide,
    Side,
    sideSetRendering
}