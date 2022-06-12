import baseConfig from "./webpack.base.config.js";
import {merge} from 'webpack-merge';

export default merge(baseConfig, {
  mode: 'production',
  target: 'electron-renderer',
  entry: './src/renderer.tsx',
  output: {
    filename: 'renderer.js'
  },
});