import logger from "./logger";
import {parse as csvParse} from "csv-parse";
import {settingList} from "./settings";
import {platformCharacter} from "./paths";
import {formatDate} from "./dateFormat";

async function openLogFile(filePath:string, rawData:boolean) {
    const data = await fetch(filePath).then(function(response) {
        return response.text();
    }).then(function(data) {
        return data;
    }).catch(function(error) {
        logger.error("Could not load log file: " + error.toString());
        return "";
    });
    
    if(rawData) {
        return data;
    } else {
        let logData:string[]|undefined = undefined;
        csvParse(data, {}, (err, output:string[]) => {
            if(err) {
                logger.errorMSG(`Error parsing csv file: ${err}`);
                logData = [];
            } else {
                logData = output;
            }
        });
        
        while(typeof logData === "undefined") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return logData;
    }
}

async function getLogTime(filePath:string) {
    return await openLogFile(filePath, false).then(function(data) {
        if(data.length > 0) {
            const time = data[1][1];
            const date = data[1][0];
            
            const endTime = data[data.length - 1][1];
            const endDate = data[data.length - 1][0];
            
            const dateList = date.split("-");
            const endDateList = endDate.split("-");
            
            const timeList = time.split(":");
            timeList.push(timeList[2].split(".")[1]);
            timeList[2] = timeList[2].split(".")[0];
            
            const endTimeList = endTime.split(":");
            endTimeList.push(endTimeList[2].split(".")[1]);
            endTimeList[2] = endTimeList[2].split(".")[0];
            
            const year = parseInt(dateList[0]);
            const month = parseInt(dateList[1]);
            const day = parseInt(dateList[2]);
            
            const hour = parseInt(timeList[0]);
            const minute = parseInt(timeList[1]);
            const second = parseInt(timeList[2]);
            const millisecond = parseInt(timeList[3]);
            
            let pastYears = parseInt(endDateList[0]) - year;
            let pastMonths = parseInt(endDateList[1]) - month;
            let pastDays = parseInt(endDateList[2]) - day;
            
            let pastHours = parseInt(endTimeList[0]) - hour;
            let pastMinutes = parseInt(endTimeList[1]) - minute;
            let pastSeconds = parseInt(endTimeList[2]) - second;
            let pastMilliseconds = parseInt(endTimeList[3]) - millisecond;
            
            if(pastMilliseconds < 0) {
                pastMilliseconds += 1000;
                pastSeconds--;
            }
            if(pastSeconds < 0) {
                pastSeconds += 60;
                pastMinutes--;
            }
            if(pastMinutes < 0) {
                pastMinutes += 60;
                pastHours--;
            }
            if(pastHours < 0) {
                pastHours += 24;
                pastDays--;
            }
            if(pastDays < 0) {
                pastDays += 30;
                pastMonths--;
            }
            if(pastMonths < 0) {
                pastMonths += 12;
                pastYears--;
            }
            
            const logTimeFormatted = formatDate(year, month, day) + " " + hour + ":" + minute + ":" + second;
            
            let logLengthFormatted = "00:00:00";
            if(pastYears > 0) {
                logLengthFormatted = pastYears + "y " + pastMonths + "m " + pastDays + "d " + pastHours + "h " + pastMinutes + "m " + pastSeconds + "s";
            } else if(pastMonths > 0) {
                logLengthFormatted = pastMonths + "m " + pastDays + "d " + pastHours + "h " + pastMinutes + "m " + pastSeconds + "s";
            } else if(pastDays > 0) {
                logLengthFormatted = pastDays + "d " + pastHours + "h " + pastMinutes + "m " + pastSeconds + "s";
            } else {
                logLengthFormatted = pastHours + "h " + pastMinutes + "m " + pastSeconds + "s";
            }
            
            return {
                start: {
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    second,
                    millisecond,
                    formatted: logTimeFormatted
                },
                length: {
                    years: pastYears,
                    months: pastMonths,
                    days: pastDays,
                    hours: pastHours,
                    minutes: pastMinutes,
                    seconds: pastSeconds,
                    milliseconds: pastMilliseconds,
                    formatted: logLengthFormatted
                }
            }
        } else {
            return {
                start: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                    formatted: "Not Found"
                },
                length: {
                    years: 0,
                    months: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                    formatted: "Not Found"
                }
            };
        }
    });
}

async function getAllLogs() {
    const loadList = [];
    
    if(settingList.log.length > 0) {
        const logs = settingList.log.substring(1).slice(0, -1).split('""');
        
        for(const log of logs) {
            loadList.push({
                name: log.split(platformCharacter())[log.split(platformCharacter()).length - 1].replace(".csv", ""),
                path: log,
                time: await getLogTime(log)
            });
        }
    }
    
    return loadList;
}

let logList = await getAllLogs();

async function reloadAllLogs() {
    logList = await getAllLogs();
}

async function updateLogs() {
    if(settingList.log.length > 0) {
        const logs = settingList.log.substring(1).slice(0, -1).split('""');
        for(const log of logs) {
            if(!logList.some(x => x.path === log)) {
                logList.push({
                    name: log.split(platformCharacter())[log.split(platformCharacter()).length - 1].replace(".csv", ""),
                    path: log,
                    time: await getLogTime(log)
                });
            }
        }
        
        for(const log of logList) {
            if(!logs.some(x => x === log.path)) {
                logList.splice(logList.indexOf(log), 1);
            }
        }
    } else {
        logList = [];
    }
}

export {
    reloadAllLogs,
    logList,
    updateLogs
};