import React, { CSSProperties } from "react";
import {openPage, Page} from "../../renderer";
import {outputArgs} from "../blenderController";
import openFolder from "../openFolder";
import {getInOutSettings, getActiveProfile} from "../settings";
import VideoPlayer from "./videoPlayer";
import path from 'path';
import {VideoJsPlayerOptions} from "video.js";
import {logList} from "../logReader";
import {renderInfo} from "../progressController";

const detailsStyle:CSSProperties = {
    display: "flex",
    marginBottom: "10px",
}
const detailsInnerStyle:CSSProperties = {
    margin: "0px",
    marginRight: "5px",
}

const VideoSpanStyle:CSSProperties = {
    display: "flex",
    alignItems: "center"
}
const videoSelectStyle:CSSProperties = {
    padding: "4px 0",
    border: "0",
    borderRadius: "14px",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "large"
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
    
    const OutputList = outputArgs.map((output, index) => {
        const outputName = output.substring(output.lastIndexOf("\\")+1);
        return <option key={index} value={outputName} title={output}>{outputName}</option>
    });
    
    React.useEffect(() => {
        setVideoSource({
            src: path.join(getInOutSettings().output, logPlaying.replace(".csv", "."+getActiveProfile().videoFormat)),
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
                <span style={VideoSpanStyle}>
                    <label htmlFor="vslct">
                        <select style={videoSelectStyle} id="vslct" required={true} value={logPlaying} onChange={e => {
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