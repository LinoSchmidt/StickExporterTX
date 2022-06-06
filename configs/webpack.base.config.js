import path from 'path';
import ESLintPlugin from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export default {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                        "@babel/preset-env",
                        "@babel/preset-react",
                        "@babel/preset-typescript",
                        ],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    output: {
        path: path.join(__dirname, '../src/.webpack'),
        libraryTarget: 'commonjs2',
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
          async: false
        }),
        new ESLintPlugin({
          extensions: ["js", "jsx", "ts", "tsx"],
        }),
    ],
    node: {
        __dirname: false,
        __filename: false,
    },
    experiments: {
        topLevelAwait: true,
    },
}