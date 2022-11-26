import React, {useState, useEffect, CSSProperties} from "react";
import { VideoFormat, editProfile, getActiveProfile, ProfileLoadDefault } from "../settings";
import {blender, blenderCmd, renderingPicture} from "../blenderController";
import {dataPath} from "../paths";
import path from "path";

let setRenderImg:React.Dispatch<React.SetStateAction<string>>;
let setRenderLoading:React.Dispatch<React.SetStateAction<boolean>>;
let pageLoaded = false;

const VideoFormatOptions = Object.keys(VideoFormat).filter((el) => { return isNaN(Number(el)) }).map(key => {
    return <option key={key} value={key}>{key}</option>;
});

function picturePath() {
    return path.join(dataPath, "render.png?t="+Date.now());
}

const overlayArrowStyle:CSSProperties = {
    width: "50%",
    height: "50%",
    fill: "white"
}
const settingLabelStyle:CSSProperties = {
    position: "relative",
    paddingLeft: "10px",
    paddingRight: "10px",
    height: "100%",
    background: "#00c24a",
    borderTopLeftRadius: "19px",
    borderBottomLeftRadius: "19px",
    fontWeight: "bolder",
    overflow: "hidden",
    display: "flex",
    alignItems: "center"
}

function InputSpan({name, value, min, step, onChange, onReset}:{name:string, value:number, min:number, step:number, onChange:React.ChangeEventHandler<HTMLInputElement>, onReset:CallableFunction}) {
    const [dispayOverlay, setDisplayOverlay] = useState("none");
    
    return (
        <span className="inputSelectSpan">
            <div style={settingLabelStyle} onMouseEnter={() => {setDisplayOverlay("flex");}} onMouseLeave={() => {setDisplayOverlay("none");}}>
                {name}
                <div className="overlay" style={{display: dispayOverlay}} onClick={() => {onReset()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={overlayArrowStyle}>
                        {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                        <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
                    </svg>
                </div>
            </div>
            <input id={name+" Input"} type="number" value={value.toString()} min={min.toString()} step={step.toString()} onChange={onChange}/>
        </span>
    )
}

function SelectSpan({name, value, optiones, onChange, onReset}:{name:string, value:string, optiones:JSX.Element[], onChange:React.ChangeEventHandler<HTMLSelectElement>, onReset:CallableFunction}) {
    const [dispayOverlay, setDisplayOverlay] = useState("none");
    
    return (
        <span className="inputSelectSpan">
            <div style={settingLabelStyle} onMouseEnter={() => {setDisplayOverlay("flex");}} onMouseLeave={() => {setDisplayOverlay("none");}}>
                {name}
                <div className="overlay" style={{display: dispayOverlay}} onClick={() => {onReset()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={overlayArrowStyle}>
                        {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                        <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
                    </svg>
                </div>
            </div>
            <select id={name+" slct"} required={true} value={value} onChange={onChange}>
                {optiones}
            </select>
        </span>
    )
}

function ToggleSpan({name, state, checkedValue, uncheckedValue, onChange, onReset}:{name:string, state:boolean, checkedValue:string, uncheckedValue:string, onChange(checked:boolean):void, onReset:CallableFunction}) {
    const [dispayOverlay, setDisplayOverlay] = useState("none");
    const [checked, setChecked] = useState(state);
    
    useEffect(() => {
        setChecked(state);
    }, [state]);
    
    const toggleStyle:CSSProperties = {
        height: "100%",
        border: "0",
        borderTopRightRadius: "18px",
        borderBottomRightRadius: "18px",
        textAlign: "center",
        fontSize: "large",
        paddingLeft: "15px",
        paddingRight: "15px",
        display: "flex",
        alignItems: "center",
        backgroundColor: checked ? "#2196F3" : "white",
        color: checked ? "white" : "black",
        cursor: "pointer",
        userSelect: "none"
    }
    
    return (
        <span className="inputSelectSpan">
            <div style={settingLabelStyle} onMouseEnter={() => {setDisplayOverlay("flex");}} onMouseLeave={() => {setDisplayOverlay("none");}}>
                {name}
                <div className="overlay" style={{display: dispayOverlay}} onClick={() => {onReset()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={overlayArrowStyle}>
                        {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                        <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
                    </svg>
                </div>
            </div>
            <div style={toggleStyle} onClick={() => {
                onChange(!checked);
                setChecked(!checked);
            }}>
                {checked ? checkedValue : uncheckedValue}
            </div>
        </span>
    )
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

function SettingsPage() {
    
    const [fps, setFps] = useState(getActiveProfile().fps);
    const [width, setWidth] = useState(getActiveProfile().width);
    const [stickDistance, setStickDistance] = useState(getActiveProfile().stickDistance);
    const [stickMode2, setStickMode2] = useState(getActiveProfile().stickMode2);
    const [videoFormat, setVideoFormat] = useState(getActiveProfile().videoFormat);
    const [renderImg, setRenderImgInner] = useState(picturePath());
    setRenderImg = setRenderImgInner;
    const [renderLoading, setRenderLoadingInner] = useState(renderingPicture);
    setRenderLoading = setRenderLoadingInner;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            editProfile({width, stickDistance, stickMode2});
            blender(blenderCmd.getRender);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [width, stickDistance, stickMode2]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            editProfile({fps, videoFormat});
        }, 500);
        
        return () => clearTimeout(timer);
    }, [fps, videoFormat]);
    
    pageLoaded = true;
    
    return (
        <div id="content">
            <div id="settingRow">
                {<InputSpan name={"FPS"} value={fps} min={1} step={1} onChange={
                    e => {
                        if(e.target.value.trim().length !== 0) setFps(parseInt(e.target.value));
                    }
                } onReset={() => {
                    ProfileLoadDefault({fps: true});
                    setFps(getActiveProfile().fps);
                }}/>}
                {<InputSpan name="Width" value={width} min={1} step={1} onChange={
                    e => {
                        if(e.target.value.trim().length !== 0) setWidth(parseInt(e.target.value));
                    }
                } onReset={() => {
                    ProfileLoadDefault({width: true});
                    setWidth(getActiveProfile().width);
                }}/>}
                {<InputSpan name="Stick Distance" value={stickDistance} min={0} step={1} onChange={
                    e => {
                        if(e.target.value.trim().length !== 0) setStickDistance(parseInt(e.target.value));
                    }
                } onReset={() => {
                    ProfileLoadDefault({stickDistance: true});
                    setStickDistance(getActiveProfile().stickDistance);
                }}/>}
            </div>
            <div id="settingRow">
                {<ToggleSpan name="Stick Mode" state={stickMode2} checkedValue={"2"} uncheckedValue={"1"} onChange={checked => {
                    setStickMode2(checked);
                }} onReset={() => {
                    ProfileLoadDefault({stickMode2: true});
                    setStickMode2(getActiveProfile().stickMode2);
                }}/>}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                }}>
                    {<SelectSpan name="Format" value={videoFormat} optiones={VideoFormatOptions} onChange={ e => {
                        setVideoFormat(e.target.value as unknown as VideoFormat);
                    }} onReset={() => {
                        ProfileLoadDefault({videoFormat: true});
                        setVideoFormat(getActiveProfile().videoFormat);
                    }}/>}
                    {videoFormat === VideoFormat.mov? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                    {videoFormat === VideoFormat.mp4? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                    {videoFormat === VideoFormat.avi? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                </div>
                <button id="resetSettingsButton" onClick={() => {
                    ProfileLoadDefault({all: true});
                    
                    setFps(getActiveProfile().fps);
                    setWidth(getActiveProfile().width);
                    setStickDistance(getActiveProfile().stickDistance);
                    setStickMode2(getActiveProfile().stickMode2);
                    setVideoFormat(getActiveProfile().videoFormat);
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
    if(pageLoaded) setRenderLoading(true);
}
function imageLoaded() {
    if(pageLoaded) {
        setRenderImg(picturePath());
        setRenderLoading(false);
    }
}

export default SettingsPage;
export {
    imageLoading,
    imageLoaded
};