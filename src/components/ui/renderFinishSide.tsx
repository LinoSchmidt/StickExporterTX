import React, { CSSProperties } from "react";
import {openSide, Side} from "../../renderer";
import {renderInfo} from "../blenderController";
import openFolder from "../openFolder";
import {settingList} from "../settings";

const detailsStyle:CSSProperties = {
    display: "flex",
    marginBottom: "10px",
}
const detailsInnerStyle:CSSProperties = {
    margin: "0px",
    marginRight: "5px",
}

function RenderFinishSide() {
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
        </div>
    );
}

export default RenderFinishSide;