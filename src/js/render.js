var lastData = "Initialise..."
var frames = "0";
var lastFrame = "0";
var logCount = 0;

var fps = 25
var width = 540
var stickDistance = 5
var stickMode2 = true
var log = '"C:\\"'
var output = "C:\\"

const statusDisplay = document.getElementById("status");
const fpsDisplay = document.getElementById("fpsInput");
const widthDistplay = document.getElementById("widthInput");
const stickDistanceDisplay = document.getElementById("stickDistanceInput");
const stickModeDisplay = document.getElementById("stickMode");
const logDisplay = document.getElementById("log");
const outputDisplay = document.getElementById("output");
const logNumberDisplay = document.getElementById("logNumber");

const logger = require('electron-log');
const fs = require("fs");
const formatXml = require("xml-formatter");
const {dialog} = require("@electron/remote");
const path = require('path');

var appName = "stickexportertx";
var dataFolder = path.join(process.env.APPDATA, appName);
var SettingFolder = path.join(dataFolder, "settings.xml");

logger.transports.console.format = "{h}:{i}:{s} {text}";
logger.transports.file.getFile();
logger.transports.file.resolvePath = () => path.join(dataFolder, "logs", "main.log");

function startRender() {
    const {exec} = require("child_process");
    var blenderCons = exec('"' + dataFolder + '\\assets\\blender\\blender" "' + dataFolder + '\\assets\\template.blend" --background --python "' + dataFolder + '\\assets\\blenderScript.py"', {maxBuffer: Infinity});
    
    frames = "0";
    lastFrame = "0";
    statusDisplay.innerHTML = lastData = "Initialise...";
    statusDisplay.style.color = "white";
    logNumberDisplay.innerHTML = "Log 0/" + String(logCount);
    blenderCons.stdout.on("data", (data) => {
        var dataStr = String(data);
        logger.info(dataStr);
        
        if(dataStr.startsWith("Frames:")) {
            frames = dataStr.split(":")[1];
        } else if(dataStr.startsWith("Fra:")) {
            lastFrame = dataStr.split(":")[1].split(" ")[0]
            lastData = "Render Frame " + lastFrame + "/" + frames;
        } else if(dataStr.startsWith("Finished")) {
            if(lastFrame == frames) {
                lastData = "Finished Render Successfully!"
                statusDisplay.style.color = "white";
            } else {
                lastData = "Something went wrong! Check Logs."
                statusDisplay.style.color = "red";
            }
        } else if(dataStr.includes("Blender quit")) {
            if(lastData != "Finished Render Successfully!") {
                lastData = "Something went wrong! Check Logs.";
                statusDisplay.style.color = "red";
            }
        } else if(dataStr.startsWith("Init:")) {
            lastData = "Initialize Frame " + dataStr.split(":")[1] + "/" + frames;
        } else if(dataStr.startsWith("Lognr:")) {
            logNumberDisplay.innerHTML = "Log " + dataStr.split(":")[1] + "/" + String(logCount);
        }
        
        if(statusDisplay.innerHTML != lastData) {
            statusDisplay.innerHTML = lastData;
        }
    });
}

function getXMLChild(doc, child) {
    return String(doc.getElementsByTagName(child)[0].childNodes[0].nodeValue);
}

function updateSettingDisplay() {
    fpsDisplay.value = String(fps);
    widthDistplay.value = String(width);
    stickDistanceDisplay.value = String(stickDistance);
    stickModeDisplay.checked = stickMode2;
    logDisplay.innerHTML = "Logs:<br/>" + log.substring(1).slice(0, -1).replaceAll("\"\"", "<br/>");
    outputDisplay.innerHTML = "Output Folder: " + output;
    logCount = log.split("\"\"").length;
    logNumberDisplay.innerHTML = "Log 0/" + String(logCount);
}

function updateSettings() {
    var xmlStr = '<?xml version="1.0"?><settings><fps>' + String(fps) +
        '</fps><width>' + String(width) +
        '</width><stickDistance>' + String(stickDistance) +
        '</stickDistance><stickMode2>' + ((stickMode2)?"true":"false") +
        '</stickMode2><log>' + log +
        '</log><output>' + output +
        '</output></settings>';
    
    fs.writeFile(SettingFolder, formatXml(xmlStr, {collapseContent: true}), function(err) {
        if(err) {
            statusDisplay.innerHTML = "Couldn't write Log! Check Logs.";
            statusDisplay.style.color = "red";
            logger.error(err);
        }
    });
}

fetch(SettingFolder).then(function(response){
    return response.text();
}).then(function(data){
    let parser = new DOMParser();
	let xmlDoc = parser.parseFromString(data, 'text/xml');
    
    fps = parseInt(getXMLChild(xmlDoc, "fps"));
    width = parseInt(getXMLChild(xmlDoc, "width"));
    stickDistance = parseInt(getXMLChild(xmlDoc, "stickDistance"));
    if(getXMLChild(xmlDoc, "stickMode2") == "false") {
        stickMode2 = false;
    } else {
        stickMode2 = true;
    }
    log = getXMLChild(xmlDoc, "log");
    output = getXMLChild(xmlDoc, "output");
    
    updateSettingDisplay();
}).catch(function(error) {
    logger.error(error);
    updateSettingDisplay();
    updateSettings();
});

function openLog() {
    dialog.showOpenDialog({
        properties: [
            "multiSelections"
        ],
        filters: [
            {
                name: "TX-Logs",
                extensions: [
                    "csv"
                ]
            }
        ]
    }).then(result => {
        logStr = "";
        result.filePaths.forEach(value => {
            logStr += "\"" + String(value) + "\"";
        });
        log = logStr;
        updateSettingDisplay();
        updateSettings();
    }).catch(err => {
        statusDisplay.innerHTML = "Something went wrong! Check Logs.";
        statusDisplay.style.color = "red";
        logger.error(err);
    });
}

function openVid() {
    dialog.showOpenDialog({
        properties: [
            "openDirectory"
        ]
    }).then(result => {
        output = String(result.filePaths);
        updateSettingDisplay();
        updateSettings();
    }).catch(err => {
        statusDisplay.innerHTML = "Something went wrong! Check Logs.";
        statusDisplay.style.color = "red";
        logger.error(err);
    });
}

function setFPS() {
    fps = parseInt(fpsDisplay.value);
    updateSettings();
}

function setWidth() {
    width = parseInt(widthDistplay.value);
    updateSettings();
}

function setStickDistance() {
    stickDistance = parseInt(stickDistanceDisplay.value);
    updateSettings();
}

function setStickMode() {
    stickMode2 = stickModeDisplay.checked;
    updateSettings();
}

function openOutputFolder() {
    require("child_process").exec('start "" "' + output + '"');
}