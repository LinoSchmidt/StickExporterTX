import baseConfig from "./webpack.base.config.js";
import {merge} from 'webpack-merge';
import { spawn } from 'child_process';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

export default merge(baseConfig, {
  mode: 'development',
  target: 'electron-renderer',
  entry: './src/renderer.tsx',
  output: {
    filename: 'renderer.js',
  },
  devServer: {
    compress: true,
    hot: true,
    host,
    port,
    onBeforeSetupMiddleware() {
      console.log('Starting Main Process...');
      spawn('npm', ['run', 'start:main'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(code))
        .on('error', (spawnError) => console.error(spawnError));
    },
  },
});