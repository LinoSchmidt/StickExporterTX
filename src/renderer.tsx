import React from "react";
import ReactDOM from "react-dom/client";
import Menu from "./components/ui/menu";
import MainSide from "./components/ui/mainSide";
import SettingsSite from "./components/ui/settingsSide";
import "./index.css";
import "./toggle-switchy.css";
import { startBlender } from "./components/blender-controller";

enum Side {
    Main,
    Settings
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
function openSide(side:Side) {
    root.render(
        <React.StrictMode>
            <Menu updateAvailable={false} side={side}/>
            {(side == Side.Main)? <MainSide/> : <SettingsSite/>}
        </React.StrictMode>
    );
}

openSide(Side.Main);

startBlender();
        
export {
    openSide,
    Side
}