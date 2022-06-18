import {spawn} from 'child_process';
import logger from './logger';

export default function openFolder(path:string) {
    if (process.platform === 'darwin') {
        spawn('open', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    } else if (process.platform === 'win32') {
        spawn('explorer', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    } else if (process.platform === 'linux') {
        spawn('xdg-open', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    }
}