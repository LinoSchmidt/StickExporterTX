import React from "react";
import ReactDOM from "react-dom";
import Menu from "./components/ui/menu";
import MainSide from "./components/ui/mainSide";
import SettingsSite from "./components/ui/settingsSide";
import "./index.css";
import "./toggle-switchy.css";

enum Side {
    Main,
    Settings
}

function openSide(side:Side) {
    ReactDOM.render(
        <React.StrictMode>
            <Menu updateAvailable={true} side={side}/>
            {(side == Side.Main)? <MainSide/> : <SettingsSite/>}
        </React.StrictMode>,
    document.getElementById('root'));
}

openSide(Side.Main);



export {
    openSide,
    Side,
}