const enum Platform {
    Windows = 'win32',
    Mac = 'darwin',
    Linux = 'linux'
}

const platform = process.platform;

const platformFolder = platform === Platform.Windows ? 'windows' : platform === Platform.Mac ? 'darwin' : 'linux';

export {
    platform,
    Platform,
    platformFolder
}