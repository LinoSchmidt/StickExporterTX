import {spawn} from 'child_process';
import logger from './logger';
import { Platform, platform } from './platform';

export default function openFolder(path:string) {
    if (platform === Platform.Mac) {
        spawn('open', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    } else if (platform === Platform.Windows) {
        spawn('explorer', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    } else if (platform === Platform.Linux) {
        spawn('xdg-open', [path]).on('error', (err) => {
            logger.errorMSG(err.message);
        });
    }
}