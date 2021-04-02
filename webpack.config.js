const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 
const marked = require('marked');

// TODO: Refactor these transforms out of here.
// TODO: Create a separate package to manage all of this for easy reuse on
// other projects.
// TODO: consider whether using the front-end framework for SSG would be safe,
// and intuitive, rather than having two completely separate rendering modes.

const layouts = {};
const CollectLayouts = {
	transformer: (content, path) => {
		// add one to dirname prefix to include separating slash
		const relativePath = path.slice(__dirname.length + 1);
		layouts[relativePath] = content.toString();
		return content.toString();
	}
};

const SSG = {
	transformer: (content, path) => {

		// TODO: move to a directives module.
		let _meta = {};
		function meta(o) {
			_meta = o;
			return '';
		}

		const body = marked(eval('`' + content.toString() + '`'));

		const metatags = Object.entries(_meta).map(entry => {
			return `<meta name="${entry[0]}" content="${entry[1]}" />`;
		}).join('\n');
		title = _meta.title;

		const layout = layouts[
			'src/layouts/'
			+ (_meta.layout || 'default')
			+ '.html'
		];
		return eval('`' + layout + '`');
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
			[
				'./src/index.js'
			].concat(glob.sync('./src/pages/**/*.js'))
			.reduce((files, path) => {
				files[path.toString().slice('./src/'.length)] = path;
				return files;
			}, {})
		,
		output: {
			filename: "[name]"
		},
		devtool,
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'static' },
					{
						from: 'src/layouts/**/*.html',
						transform: CollectLayouts
					},
					{
						from: 'src/pages/**/*.md',
						to: '[name].html',
						transform: SSG
					},
					{
						from: 'src/pages/**/*.html',
						to: '[name].html'
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
