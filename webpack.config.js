const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 
const marked = require('marked');

const templates = {};
const CollectTemplates = {
	transformer: (content, path) => {
		templates[path] = content;
		return null;
	}
};

const SSG = {
	transformer: (content, path) => {
		return `<!doctype html><html><body>${marked(content.toString())}</body></html>`;
	}
};

module.exports = (env, argv) => {
	var devtool = 'source-map';
	if (argv.mode == 'development') {
		devtool = 'eval-cheap-source-map';
	}

	return {
		devServer: {
			contentBase: path.join(__dirname, 'dist'),
			compress: true,
			port: 9999,
			watchContentBase: true,
			liveReload: true
		},
		entry:
			// glob.sync('./src/pages/**/*.js')
			[]
			.concat(['./src/index.js'])
		,
		output: {
			filename: "[name].js"
		},
		devtool,
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'static' },
					/* {
						from: 'templates',
						to: '/dev/null',
						transform: CollectTemplates
					}, */
					{
						from: 'src/pages/**/*.md',
						to: '[name].html',
						transform: SSG
					}
				],
			})
		],
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				},
				{
					test: /\.html$/,
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
					}
				},
				{
					test: /\.mjs$/,
					resolve: {
						fullySpecified: false
					}
				},
				{
					test: /\.tpl$/,
					use: "raw-loader",
				},
			]
		}
	};
};
