/*global require: false, module: false, __dirname: false */
'use strict';
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
	historyApiFallback: true,
	entry: "./js/index",
	output: {
		path: "./dist",
		publicPath: "/",
		filename: "static-interval-tree.js",
		library: "static-interval-tree",
		libraryTarget: "umd"
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory=cache'}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Template Project",
			filename: "index.html",
			template: "page.template"
		}),
		new webpack.OldWatchingPlugin()
	],
	resolve: {
		extensions: ['', '.js', '.json', '.coffee'],
		root: __dirname + "/js"
	}
};
