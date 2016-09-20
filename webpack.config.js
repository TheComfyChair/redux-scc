const webpack = require('webpack');
const path = require('path');
const _ = require('lodash');

const PATH_ESLINT = path.join(__dirname, '.eslintrc.js');
const PATH_SRC = path.join(__dirname, 'src');

module.exports = {
    context: __dirname,
    entry: {
        'shell-game': PATH_SRC
    },
    devServer: {
        inline: true,
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    devtool: 'inline-source-map',
    eslint: {
        configFile: PATH_ESLINT,
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                include: [PATH_SRC],
                exclude: [],
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.scss$/,
                loaders: [
                    'style',
                    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                    'sass'
                ]
            }
        ],
        preLoaders: [ { test: /\.js$/, include: [PATH_SRC], loader: 'eslint-loader' } ]
    },
    resolve: {
        extensions: ['', '.js', '.json', '.jsx'],
        alias: [
            { 'shell-game': PATH_SRC }
        ],
    },
    plugins: [
        function () {
            this.plugin('done', () =>
                setTimeout(() => console.log('\nFinished at ' + (new Date).toLocaleTimeString() + '\n'), 10)
            );
        },
        new webpack.HotModuleReplacementPlugin(),
    ]
};