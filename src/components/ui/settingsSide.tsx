import React, {useState, useEffect} from "react";
import { settingList, updateSettings, settingListLoadDefault } from "../settings";
import {blender, blenderCmd, renderingPicture} from "../blender-controller";
import {dataPath} from "../paths";
import path from "path";

let setRenderImg:React.Dispatch<React.SetStateAction<string>>;
let setRenderLoading:React.Dispatch<React.SetStateAction<boolean>>;
let sideLoaded = false;

function picturePath() {
    return path.join(dataPath, "render.png?t="+Date.now());
}

const RenderLoadingSpinner = () => (
    <div id="renderLoadingDiv">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            {/* Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}
            <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z"/>
        </svg>
    </div>
);

function SettingsSide() {
    
    const [fps, setFps] = useState(settingList.fps);
    const [width, setWidth] = useState(settingList.width);
    const [stickDistance, setStickDistance] = useState(settingList.stickDistance);
    const [stickMode2, setStickMode2] = useState(settingList.stickMode2);
    const [renderImg, setRenderImgInner] = useState(picturePath());
    setRenderImg = setRenderImgInner;
    const [renderLoading, setRenderLoadingInner] = useState(renderingPicture);
    setRenderLoading = setRenderLoadingInner;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            updateSettings({fps, width, stickDistance, stickMode2});
            blender(blenderCmd.getRender);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [fps, width, stickDistance, stickMode2]);
    
    sideLoaded = true;
    
    return (
        <div id="content">
            <div className="dataDiv">
                <p>FPS: </p>
                <input id="fpsInput" type="number" value={fps.toString()} min="1" step="1" onChange={e => {
                    if(e.target.value.trim().length !== 0) setFps(parseInt(e.target.value));
                }}/>
            </div>
            <div className="dataDiv">
                <p>Width: </p>
                <input id="widthInput" type="number" value={width.toString()} min="1" step="1" onChange={e => {
                    if(e.target.value.trim().length !== 0) setWidth(parseInt(e.target.value));
                }}/>
            </div>
            <div className="dataDiv">
                <p>Stick Distance: </p>
                <input id="stickDistanceInput" type="number" value={stickDistance.toString()} min="0" step="1" onChange={e => {
                    if(e.target.value.trim().length !== 0) setStickDistance(parseInt(e.target.value));
                }}/>
            </div>
            <div className="dataDiv">
                <p>Stick Mode:</p>
                <label htmlFor="stickMode" className="toggle-switchy" data-style="rounded" data-text="12">
                    <input checked={stickMode2} type="checkbox" id="stickMode" onChange={e => {
                        setStickMode2(e.target.checked);
                    }}/>
                    <span className="toggle">
                        <span className="switch"></span>
                    </span>
                </label>
            </div>
            <button onClick={() => {
                settingListLoadDefault();
                
                setFps(settingList.fps);
                setWidth(settingList.width);
                setStickDistance(settingList.stickDistance);
                setStickMode2(settingList.stickMode2);
            }}>Reset Settings</button>
            <div id="renderImgDiv">
                <img id="render-ex" src={renderImg}></img>
                {renderLoading? <RenderLoadingSpinner/> : null}
            </div>
        </div>
    )
}

function imageLoading() {
    if(sideLoaded) setRenderLoading(true);
}
function imageLoaded() {
    if(sideLoaded) {
        setRenderImg(picturePath());
        setRenderLoading(false);
    }
}

export default SettingsSide;
export {
    imageLoading,
    imageLoaded
};