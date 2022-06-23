import electronLog from 'electron-log';
import {dataPath} from './paths';
import {dialog} from '@electron/remote';
import path from 'path';
import {exec} from "child_process";

electronLog.transports.console.format = "{h}:{i}:{s} {text}";
electronLog.transports.file.getFile();
electronLog.transports.file.resolvePath = () => path.join(dataPath, "logs", "main.log");

const logger = {
    info: function (message:string) {
        electronLog.info(message);
    },
    error: function (message:string) {
        electronLog.error(message);
    },
    warning: function (message:string) {
        electronLog.warn(message);
    },
    errorMSG: function (message:string) {
        logger.error(message);
    
        dialog.showMessageBox({
            type: 'error',
            noLink: true,
            buttons: ['Open Log', 'OK'],
            defaultId: 1,
            title: 'Something went wrong!',
            message: 'An error has occurred:',
            detail: message
        }).then(res => {
            if(res.response === 0) {
                exec('start "" "' + path.join(dataPath, "logs") + '"');
            }
        });
    },
    warningMSG: function (message:string) {
        logger.warning(message);
    
        dialog.showMessageBox({
            type: 'warning',
            buttons: ['OK'],
            defaultId: 1,
            title: 'Warning!',
            message: message
        });
    }
}

export default logger;