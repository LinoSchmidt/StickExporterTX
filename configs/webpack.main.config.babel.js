import baseConfig from "./webpack.base.config.js";
import {merge} from 'webpack-merge';

export default merge(baseConfig, {
  target: 'electron-main',
  entry: './src/index.ts',
  output: {
    filename: 'index.js'
  },
});