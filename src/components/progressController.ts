import {setProgress} from "../renderer";
import {getLogSize} from "./logReader";
import {getInOutSettings} from "./settings";
import { setRenderDisplayProgress, setPastTimeNow, setRemainingTimeNow } from "./ui/renderingPage";

const estimatedRenderPortion = 0.97;

const renderInfo = {
    time: "0min 0sec",
    startTime: 0,
    endTime: 0
}

let logPortionList:number[] = [];
let currentLogPortion = 0;

function setRenderProgress(log:number, init:boolean, frameCount:number, frame:number) {
    let progress = 0;
    if(init) {
        progress = logPortionList[log-1] * (frame / frameCount * (1 - estimatedRenderPortion)) + currentLogPortion;
    } else {
        progress = logPortionList[log-1] * (frame / frameCount * estimatedRenderPortion + (1 - estimatedRenderPortion)) + currentLogPortion;
    }
    setProgress(progress);
    setRenderDisplayProgress(parseFloat((progress*100).toFixed(2)));
    
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - renderInfo.startTime;
    let timeDiffSeconds = timeDiff / 1000;
    let timeDiffMinutes = 0;
    while(timeDiffSeconds > 60) {
        timeDiffMinutes++;
        timeDiffSeconds -= 60;
    }
    renderInfo.time = timeDiffMinutes + "m " + timeDiffSeconds.toFixed(0) + "s";
    setPastTimeNow(renderInfo.time);
    
    if(progress > 0) {
        const timeRemaining = (timeDiff / progress) * (1 - progress);
        timeDiffSeconds = timeRemaining / 1000;
        timeDiffMinutes = 0;
        while(timeDiffSeconds > 60) {
            timeDiffMinutes++;
            timeDiffSeconds -= 60;
        }
        setRemainingTimeNow(timeDiffMinutes + "m " + timeDiffSeconds.toFixed(0) + "s");
    }
}

function resetRenderProgress() {
    logPortionList = [];
    currentLogPortion = 0;
    
    const logSizeList:number[] = [];
    getInOutSettings().logs.forEach(function (value, index) {
        logSizeList.push(getLogSize(index));
    });
    
    let fullLogSize = 0;
    for(let i = 0; i < logSizeList.length; i++) {
        fullLogSize += logSizeList[i];
    }
    
    logSizeList.forEach(function (value) {
        logPortionList.push(value / fullLogSize);
    });
    
    setPastTimeNow("0min 0sec");
    setRemainingTimeNow("calculating...");
}

function setLog(log:number) {
    currentLogPortion += logPortionList[log-2];
}

function stopProgress() {
    renderInfo.endTime = new Date().getTime();
}

function startProgress() {
    renderInfo.startTime = new Date().getTime();
    resetRenderProgress();
}

export {
    setRenderProgress,
    resetRenderProgress,
    setLog,
    stopProgress,
    startProgress,
    renderInfo
}