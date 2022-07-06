import React, {useState, useEffect, CSSProperties} from "react";
import { settingList, updateSettings, settingListLoadDefault, VideoFormat } from "../settings";
import {blender, blenderCmd, renderingPicture} from "../blenderController";
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

function VideoFormatWarning({videoFormat}:{videoFormat:VideoFormat}) {
    let message = "";
    
    switch(videoFormat) {
        case VideoFormat.mp4:
            message = "mp4 has no support for alpha channel and the background will be black.";
            break;
        case VideoFormat.avi:
            message = "avi can't be played in the preview of this app.";
            break;
        case VideoFormat.mkv:
            message = "mkv can't be played in the preview of this app.";
            break;
        case VideoFormat.mov:
            message = "mov can't be played in the preview of this app.";
            break;
    }
    
    const style:CSSProperties = {
        height: "30px",
        width: "30px",
        fill: "orange",
        paddingLeft: "5px",
        
    };
    
    return (
        <div id="videoFormatWarning" title={message} style={style}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                {/* <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                <path d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"/>
            </svg>
        </div>
    );
}

function SettingsSide() {
    
    const [fps, setFps] = useState(settingList.fps);
    const [width, setWidth] = useState(settingList.width);
    const [stickDistance, setStickDistance] = useState(settingList.stickDistance);
    const [stickMode2, setStickMode2] = useState(settingList.stickMode2);
    const [videoFormat, setVideoFormat] = useState(settingList.videoFormat);
    const [renderImg, setRenderImgInner] = useState(picturePath());
    setRenderImg = setRenderImgInner;
    const [renderLoading, setRenderLoadingInner] = useState(renderingPicture);
    setRenderLoading = setRenderLoadingInner;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            updateSettings({width, stickDistance, stickMode2});
            blender(blenderCmd.getRender);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [width, stickDistance, stickMode2]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            updateSettings({fps, videoFormat});
        }, 500);
        
        return () => clearTimeout(timer);
    }, [fps, videoFormat]);
    
    sideLoaded = true;
    
    const VideoFormatOptions = Object.keys(VideoFormat).filter((el) => { return isNaN(Number(el)) }).map(key => {
        return <option key={key} value={key}>{key}</option>;
    });
    
    return (
        <div id="content">
            <div id="settingRow">
                <span className="inputSpan">
                    <label>FPS</label>
                    <input id="fpsInput" type="number" value={fps.toString()} min="1" step="1" onChange={e => {
                        if(e.target.value.trim().length !== 0) setFps(parseInt(e.target.value));
                    }}/>
                </span>
                <span className="inputSpan">
                    <label>Width</label>
                    <input id="widthInput" type="number" value={width.toString()} min="1" step="1" onChange={e => {
                        if(e.target.value.trim().length !== 0) setWidth(parseInt(e.target.value));
                    }}/>
                </span>
                <span className="inputSpan">
                    <label>Stick Distance</label>
                    <input id="stickDistanceInput" type="number" value={stickDistance.toString()} min="0" step="1" onChange={e => {
                        if(e.target.value.trim().length !== 0) setStickDistance(parseInt(e.target.value));
                    }}/>
                </span>
            </div>
            <div id="settingRow">
                <div className="dataDiv">
                    <p>Stick Mode</p>
                    <label htmlFor="stickMode" className="toggle-switchy" data-style="rounded" data-text="12">
                        <input checked={stickMode2} type="checkbox" id="stickMode" onChange={e => {
                            setStickMode2(e.target.checked);
                        }}/>
                        <span className="toggle">
                            <span className="switch"></span>
                        </span>
                    </label>
                </div>
                <span className="selectSpan">
                    <label className="selectSpanLabel">Format</label>
                    <label className="selectSpanSelect" htmlFor="slct">
                        <select id="slct" required={true} value={videoFormat} onChange={e => {
                            setVideoFormat(e.target.value as unknown as VideoFormat);
                        }}>
                            {VideoFormatOptions}
                        </select>
                    </label>
                    {videoFormat === VideoFormat.mov? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                    {videoFormat === VideoFormat.mp4? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                    {videoFormat === VideoFormat.avi? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                </span>
                <button id="resetSettingsButton" onClick={() => {
                    settingListLoadDefault();
                    
                    setFps(settingList.fps);
                    setWidth(settingList.width);
                    setStickDistance(settingList.stickDistance);
                    setStickMode2(settingList.stickMode2);
                    setVideoFormat(settingList.videoFormat);
                }}>Reset Settings</button>
            </div>
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