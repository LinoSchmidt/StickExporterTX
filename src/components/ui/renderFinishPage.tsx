import React, { CSSProperties } from "react";
import {openPage, Page} from "../../renderer";
import {renderInfo} from "../blenderController";
import openFolder from "../openFolder";
import {getInOutSettings, getActiveProfile} from "../settings";
import VideoPlayer from "./videoPlayer";
import path from 'path';
import {VideoJsPlayerOptions} from "video.js";
import {logList} from "../logReader";

const detailsStyle:CSSProperties = {
    display: "flex",
    marginBottom: "10px",
}
const detailsInnerStyle:CSSProperties = {
    margin: "0px",
    marginRight: "5px",
}

function RenderFinishPage() {
    const [logPlaying, setLogPlaying] = React.useState(logList[0].name);
    
    const videoPlayerOptions:VideoJsPlayerOptions = {
        controls: true,
        muted: true,
        fluid: true,
        controlBar: {
            volumePanel: false,
        }
    };
    
    const [videoSource, setVideoSource] = React.useState({src: path.join(getInOutSettings().output, logPlaying+"."+getActiveProfile().videoFormat), type: 'video/'+getActiveProfile().videoFormat.toUpperCase()});
    
    const OutputList = logList.map((inputLog, index) => {
        const outputLogPath = path.join(getInOutSettings().output, inputLog.name+"."+getActiveProfile().videoFormat);
        return <option key={index} value={inputLog.name} title={outputLogPath}>{inputLog.name}</option>
    });
    
    React.useEffect(() => {
        setVideoSource({
            src: path.join(getInOutSettings().output, logPlaying+"."+getActiveProfile().videoFormat),
            type: 'video/'+getActiveProfile().videoFormat.toUpperCase()
        });
    }, [logPlaying]);
    
    return (
        <div id="content">
            <h3 style={{
                color: "#00c24a",
            }}>Render finished Successfully!</h3>
            <div style={detailsStyle}>
                <h4 style={detailsInnerStyle}>Duration:</h4>
                <p style={detailsInnerStyle}>{renderInfo.time}</p>
            </div>
            <div style={detailsStyle}>
                <h4 style={detailsInnerStyle}>Start Time:</h4>
                <p style={detailsInnerStyle}>{new Date(renderInfo.startTime).toLocaleString().replace(",", "")}</p>
            </div>
            <div style={detailsStyle}>
                <h4 style={detailsInnerStyle}>End Time:</h4>
                <p style={detailsInnerStyle}>{new Date(renderInfo.endTime).toLocaleString().replace(",", "")}</p>
            </div>
            <button style={{
                marginTop: "10px",
                marginRight: "10px",
                backgroundColor: "#00c24a",
            }} onClick={() => {
                openPage(Page.Main);
            }}>Finish</button>
            <button onClick={() => openFolder(getInOutSettings().output)}>Open Output Folder</button>
            <div style={{
                marginTop: "10px"
            }}>
                <span className="selectSpan">
                    <label className="videoSelect" htmlFor="vslct">
                        <select id="vslct" required={true} value={logPlaying} onChange={e => {
                            setLogPlaying(e.target.value);
                        }}>
                            {OutputList}
                        </select>
                    </label>
                </span>
                <VideoPlayer options={videoPlayerOptions} src={videoSource} />
            </div>
        </div>
    );
}

export default RenderFinishPage;