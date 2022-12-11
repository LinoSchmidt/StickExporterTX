import React, {useState, useEffect, CSSProperties} from "react";
import { VideoFormat, editProfile, getActiveProfile, ProfileLoadDefault, getProfiles, setActiveProfile, createProfile, removeProfile, exportProfile, importProfile } from "../settings";
import {blender, blenderCmd, renderingPicture} from "../blenderController";
import {dataPath} from "../paths";
import path from "path";
import logger from "../logger";

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

function TextSpan({name, value, placeholder, onChange, onReset}:{name:string, value:string, placeholder:string, onChange:React.ChangeEventHandler<HTMLInputElement>, onReset?:CallableFunction}) {
    const [dispayOverlay, setDisplayOverlay] = useState("none");
    
    const Overlay = (
        <div className="overlay" style={{display: dispayOverlay}} onClick={() => {
                if(onReset !== undefined) {
                    onReset()
                }
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={overlayArrowStyle}>
                {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
            </svg>
        </div>
    )
    
    return (
        <span className="inputSelectSpan">
            <div style={settingLabelStyle} onMouseEnter={() => {setDisplayOverlay("flex");}} onMouseLeave={() => {setDisplayOverlay("none");}}>
                {name}
                {onReset !== undefined ? Overlay : null}
            </div>
            <input id={name+" Input"} type="text" value={value.toString()} placeholder={placeholder} onChange={onChange}/>
        </span>
    )
}

function SelectSpan({name, value, optiones, onChange, onReset}:{name:string, value:string, optiones:JSX.Element[], onChange:React.ChangeEventHandler<HTMLSelectElement>, onReset?:CallableFunction}) {
    const [dispayOverlay, setDisplayOverlay] = useState("none");
    
    const Overlay = (
        <div className="overlay" style={{display: dispayOverlay}} onClick={() => {
                if(onReset !== undefined) {
                    onReset()
                }
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={overlayArrowStyle}>
                {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                <path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/>
            </svg>
        </div>
    )
    
    return (
        <span className="inputSelectSpan">
            <div style={settingLabelStyle} onMouseEnter={() => {setDisplayOverlay("flex");}} onMouseLeave={() => {setDisplayOverlay("none");}}>
                {name}
                {onReset !== undefined ? Overlay : null}
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
        height: "35px",
        width: "35px",
        fill: "yellow",
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

function ProfileSettings({setNameProfile, setProfileName, setNewProfileName, profileName, setNewProfileType, setProfileOptions}:{setNameProfile:CallableFunction, setProfileName:CallableFunction, setNewProfileName:CallableFunction, profileName:string, setNewProfileType:CallableFunction, setProfileOptions:CallableFunction}) {
    return (
        <>
            <button title="Rename" style={{width:"35px", height:"35px", marginLeft:"5px"}} onClick={() => {
                    setNewProfileName(profileName);
                    setNameProfile(true);
                    setNewProfileType("rename");
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{fill:"white"}}>
                    {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.8 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
                </svg>
            </button>
            <button title="Create" style={{width:"35px", height:"35px", marginLeft:"5px"}} onClick={() => {
                    setNewProfileName("");
                    setNameProfile(true);
                    setNewProfileType("create");
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{fill:"white"}}>
                    {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
                </svg>
            </button>
            <button title="Duplicate" style={{width:"35px", height:"35px", marginLeft:"5px"}} onClick={() => {
                    setNewProfileName("");
                    setNameProfile(true);
                    setNewProfileType("duplicate");
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{fill:"white"}}>
                    {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M502.6 70.63l-61.25-61.25C435.4 3.371 427.2 0 418.7 0H255.1c-35.35 0-64 28.66-64 64l.0195 256C192 355.4 220.7 384 256 384h192c35.2 0 64-28.8 64-64V93.25C512 84.77 508.6 76.63 502.6 70.63zM464 320c0 8.836-7.164 16-16 16H255.1c-8.838 0-16-7.164-16-16L239.1 64.13c0-8.836 7.164-16 16-16h128L384 96c0 17.67 14.33 32 32 32h47.1V320zM272 448c0 8.836-7.164 16-16 16H63.1c-8.838 0-16-7.164-16-16L47.98 192.1c0-8.836 7.164-16 16-16H160V128H63.99c-35.35 0-64 28.65-64 64l.0098 256C.002 483.3 28.66 512 64 512h192c35.2 0 64-28.8 64-64v-32h-47.1L272 448z"/>
                </svg>
            </button>
            <button title="Delete" style={{width:"35px", height:"35px", backgroundColor:"#e1334e", marginLeft:"5px"}} onClick={() => {
                    removeProfile(profileName);
                    const newActiveProfile = getProfiles()[getProfiles().length - 1];
                    setActiveProfile(newActiveProfile);
                    setProfileName(newActiveProfile);
                    setProfileOptions(getProfiles().map(p => {
                        return <option key={p} value={p}>{p}</option>;
                    }));
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{fill:"white"}}>
                    {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                    <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                </svg>
            </button>
        </>
    )
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
    const [profileOptions, setProfileOptions] = useState(getProfiles().map(p => {
        return <option key={p} value={p}>{p}</option>;
    }));
    const [profileName, setProfileName] = useState(getActiveProfile().profileName);
    const [newProfileName, setNewProfileName] = useState("");
    const [nameProfile, setNameProfile] = useState(false);
    const [newProfileType, setNewProfileType] = useState("");
    
    useEffect(() => {
        setFps(getActiveProfile().fps);
        setWidth(getActiveProfile().width);
        setStickDistance(getActiveProfile().stickDistance);
        setStickMode2(getActiveProfile().stickMode2);
        setVideoFormat(getActiveProfile().videoFormat);
    }, [profileName]);
    
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
                <div style={{
                        display: "flex",
                    }}>
                    {nameProfile? <TextSpan name="Set Profile Name" value={newProfileName} placeholder="Enter Profile Name Here" onChange={e => {
                            setNewProfileName(e.target.value);
                        }}/> : <SelectSpan name="Select Profile" value={profileName} optiones={profileOptions} onChange={ e => {
                            setActiveProfile(e.target.value);
                            setProfileName(e.target.value);
                        }}/>
                    }
                    {nameProfile? <button title="Save" style={{width:"35px", height:"35px", marginLeft:"5px"}} onClick={() => {
                                let profileExists = false;
                                getProfiles().forEach(profile => {
                                    if (profile === newProfileName) {
                                        profileExists = true;
                                    }
                                });
                                
                                if (profileExists) {
                                    logger.warningMSG("Profile with the name \""+newProfileName+"\" already exists");
                                } else {
                                    setProfileName(newProfileName);
                                    if(newProfileType === "rename") {
                                        editProfile({profileName: newProfileName});
                                    } else if (newProfileType === "create") {
                                        createProfile(newProfileName, false);
                                    } else if (newProfileType === "duplicate") {
                                        createProfile(newProfileName, true);
                                    }
                                    setActiveProfile(newProfileName);
                                }
                                setProfileOptions(getProfiles().map(p => {
                                    return <option key={p} value={p}>{p}</option>;
                                }));
                                setNameProfile(false);
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{fill:"white"}}>
                                {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                                <path d="M224 256c-35.2 0-64 28.8-64 64c0 35.2 28.8 64 64 64c35.2 0 64-28.8 64-64C288 284.8 259.2 256 224 256zM433.1 129.1l-83.9-83.9C341.1 37.06 328.8 32 316.1 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V163.9C448 151.2 442.9 138.9 433.1 129.1zM128 80h144V160H128V80zM400 416c0 8.836-7.164 16-16 16H64c-8.836 0-16-7.164-16-16V96c0-8.838 7.164-16 16-16h16v104c0 13.25 10.75 24 24 24h192C309.3 208 320 197.3 320 184V83.88l78.25 78.25C399.4 163.2 400 164.8 400 166.3V416z"/>
                            </svg>
                        </button> : <ProfileSettings setNameProfile={setNameProfile} setProfileName={setProfileName} setNewProfileName={setNewProfileName} profileName={profileName} setNewProfileType={setNewProfileType} setProfileOptions={setProfileOptions}/>
                    }
                </div>
                <div style={{
                        display: "flex",
                    }}>
                    <button title="Import" style={{width:"35px", height:"35px"}} onClick={() => {
                        importProfile(() => {
                            setProfileOptions(getProfiles().map(p => {
                                return <option key={p} value={p}>{p}</option>;
                            }));
                        });
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{fill:"white"}}>
                            {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                            <path d="M128 64c0-35.3 28.7-64 64-64H352V128c0 17.7 14.3 32 32 32H512V448c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V336H302.1l-39 39c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l39 39H128V64zm0 224v48H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H128zM512 128H384V0L512 128z"/>
                        </svg>
                    </button>
                    <button title="Export" style={{width:"35px", height:"35px", marginLeft:"5px"}} onClick={() => {
                        exportProfile();
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style={{fill:"white"}}>
                            {/* <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --> */}
                            <path d="M32 64C32 28.7 60.7 0 96 0H256V128c0 17.7 14.3 32 32 32H416V288H248c-13.3 0-24 10.7-24 24s10.7 24 24 24H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V64zM416 336V288H526.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H416zm0-208H288V0L416 128z"/>
                        </svg>
                    </button>
                </div>
            </div>
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
                    {videoFormat === VideoFormat.mkv? <VideoFormatWarning videoFormat={videoFormat}/> : null}
                </div>
                <button id="resetSettingsButton" onClick={() => {
                    ProfileLoadDefault({all: true});
                    
                    setFps(getActiveProfile().fps);
                    setWidth(getActiveProfile().width);
                    setStickDistance(getActiveProfile().stickDistance);
                    setStickMode2(getActiveProfile().stickMode2);
                    setVideoFormat(getActiveProfile().videoFormat);
                }}>Reset Profile</button>
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