import React, { CSSProperties } from "react";
import {openSide, Side} from "../../renderer";
import {renderInfo} from "../blenderController";
import openFolder from "../openFolder";
import {settingList} from "../settings";
import VideoPlayer from "./videoPlayer";
import path from 'path';
import {platformCharacter} from "../paths";
import {VideoJsPlayerOptions} from "video.js";

const detailsStyle:CSSProperties = {
    display: "flex",
    marginBottom: "10px",
}
const detailsInnerStyle:CSSProperties = {
    margin: "0px",
    marginRight: "5px",
}

function RenderFinishSide() {
    const [logPlaying, setLogPlaying] = React.useState(path.join(settingList.output, settingList.log.substring(1).slice(0, -1).split('""')[0].split(platformCharacter())[settingList.log.substring(1).slice(0, -1).split('""')[0].split(platformCharacter()).length - 1].replace(".csv", "."+settingList.videoFormat)));
    
    const [logList, setLogList] = React.useState([<li key={0}></li>]);
    
    const videoPlayerOptions:VideoJsPlayerOptions = {
        controls: true,
        muted: true,
        fluid: true,
        controlBar: {
            volumePanel: false,
        }
    };
    
    const [videoSource, setVideoSource] = React.useState({src: logPlaying, type: 'video/'+settingList.videoFormat.toUpperCase()});
    
    React.useEffect(() => {
        setLogList(settingList.log.substring(1).slice(0, -1).split('""').map((inputLog, index) => {
            const outputLogName = inputLog.split(platformCharacter())[inputLog.split(platformCharacter()).length - 1].replace(".csv", "");
            const outputLogPath = path.join(settingList.output, outputLogName+"."+settingList.videoFormat);
            
            return <li key={index}>
                <p style={{
                    textDecoration: logPlaying === outputLogPath ? "underline" : "none",
                }} onClick={() => {
                    setLogPlaying(outputLogPath);
                }} title={outputLogPath}>{outputLogName}</p>
            </li>
        }));
        
        setVideoSource({
            src: logPlaying,
            type: 'video/'+settingList.videoFormat.toUpperCase()
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
                openSide(Side.Main);
            }}>Finish</button>
            <button onClick={() => openFolder(settingList.output)}>Open Output Folder</button>
            <div style={{
                marginTop: "10px"
            }}>
                <VideoPlayer options={videoPlayerOptions} src={videoSource} />
                <ol>
                    {logList}
                </ol>
            </div>
        </div>
    );
}

export default RenderFinishSide;