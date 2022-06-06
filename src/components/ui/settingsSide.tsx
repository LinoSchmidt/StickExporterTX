import React, {useState} from "react";
import { settingList, updateSettings, settingListLoadDefault } from "../settings";

function SettingsSide() {
    
    const [fps, setFps] = useState(settingList.fps);
    const [width, setWidth] = useState(settingList.width);
    const [stickDistance, setStickDistance] = useState(settingList.stickDistance);
    const [stickMode2, setStickMode2] = useState(settingList.stickMode2);
    
    return (
        <div id="content">
            <div className="dataDiv">
                <p>FPS: </p>
                <input id="fpsInput" type="number" value={fps.toString()} min="1" step="1" onChange={e => {
                    updateSettings({fps:parseInt(e.target.value)});
                    setFps(settingList.fps);
                }}/>
            </div>
            <div className="dataDiv">
                <p>Width: </p>
                <input id="widthInput" type="number" value={width.toString()} min="1" step="1" onChange={e => {
                    updateSettings({width:parseInt(e.target.value)});
                    setWidth(settingList.width);
                }}/>
            </div>
            <div className="dataDiv">
                <p>Stick Distance: </p>
                <input id="stickDistanceInput" type="number" value={stickDistance.toString()} min="0" step="1" onChange={e => {
                    updateSettings({stickDistance:parseInt(e.target.value)});
                    setStickDistance(settingList.stickDistance);
                }}/>
            </div>
            <div className="dataDiv">
                <p>Stick Mode:</p>
                <label htmlFor="stickMode" className="toggle-switchy" data-style="rounded" data-text="12">
                    <input checked={stickMode2} type="checkbox" id="stickMode" onChange={e => {
                        updateSettings({stickMode2:e.target.checked});
                        setStickMode2(settingList.stickMode2);
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
        </div>
    )
}

export default SettingsSide;