import React from "react";
import ReactDOM from "react-dom/client";
import Menu from "./components/ui/menu";
import MainPage from "./components/ui/mainPage";
import SettingsPage from "./components/ui/settingsPage";
import RenderingPage from "./components/ui/renderingPage";
import RenderFinishPage from "./components/ui/renderFinishPage";
import "./index.css";
import "./toggle-switchy.css";
import { blender, blenderCmd, startBlender } from "./components/blenderController";
import {ipcRenderer} from "electron";

enum Page {
    Main,
    Rendering,
    Settings,
    RenderFinish
}

let rendering = false;
let currentPage = Page.Main;

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
function openPage(page:Page) {
    if(page == Page.Main && rendering) {
        page = Page.Rendering;
    }
    currentPage = page;
    
    root.render(
        <React.StrictMode>
            <Menu page={page}/>
            {(page === Page.Main)? <MainPage/> : null}
            {(page === Page.Settings)? <SettingsPage/> : null}
            {(page === Page.Rendering)? <RenderingPage/> : null}
            {(page === Page.RenderFinish)? <RenderFinishPage/> : null}
        </React.StrictMode>
    );
}

openPage(currentPage);

window.addEventListener("keydown", (e:KeyboardEvent) => {
    if(e.key === "Escape") {
        if(currentPage === Page.Main) {
            ipcRenderer.send("closeApp");
        } else if(currentPage === Page.Rendering) {
            blender(blenderCmd.stopRendering);
        } else {
            openPage(Page.Main);
        }
    }
});

startBlender();

function pageSetRendering(value:boolean) {
    rendering = value;
    if(value) {
        if(currentPage === Page.Main) {
            openPage(Page.Rendering);
        }
    } else {
        if(currentPage === Page.Rendering) {
            openPage(Page.Main);
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
    openPage,
    Page,
    pageSetRendering,
    setProgress
}