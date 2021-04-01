const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 
const marked = require('marked');
const YAML = require('yaml');

// TODO: Refactor these transforms out of here.
// TODO: Create a separate package to manage all of this for easy reuse on
// other projects.

const layouts = {};
const CollectLayouts = {
	transformer: (content, path) => {
		// add one to dirname prefix to include separating slash
		const relativePath = path.slice(__dirname.length + 1);
		layouts[relativePath] = content.toString();

		// return a string to make webpack copy source plugin happy
		return '';
	}
};

const SSG = {
	transformer: (content, path) => {
		let [_, header, body] = content.toString().split(/^---+$/mg);
		meta = header && body ? YAML.parse(header) : {};

		const metatags = Object.entries(meta).map(entry => {
			return `<meta name="${entry[0]}" content="${entry[1]}" />`;
		}).join('\n');
		title = meta.title;
		body = marked(body || content.toString());

		const layout = layouts[
			'src/layouts/'
			+ (meta.layout || 'default')
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
					{
						from: 'src/layouts/**/*.html',
						to: '/dev/null',
						transform: CollectLayouts
					},
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
