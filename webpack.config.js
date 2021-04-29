const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 
const marked = require('marked');

// TODO: Refactor these transforms out of here.
// TODO: Create a separate package to manage all of this for easy reuse on
// other projects.
// TODO: consider whether using the front-end framework for SSG would be safe,
// and intuitive, rather than having two completely separate rendering modes.

function distPath({subpathOut = '', subpathIn = ''} = {}) {
	return function({context, absoluteFilename}) {
		const prefixIn = path.resolve(context, subpathIn);
		const prefixOut = path.resolve(context, 'dist', subpathOut);
		const relativeName = path.join('./', absoluteFilename.slice(prefixIn.toString().length));
		const fullOutPath = path.resolve(prefixOut, relativeName)
			.replace(/\.md$/, ".html");
		console.log(`Mapping ${relativeName} to ${fullOutPath}`);
		return fullOutPath;
	};
};

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
	transformer: (content, _path) => {

		// TODO: move to a directives module.
		let _meta = {};
		function meta(o) {
			_meta = o;
			return '';
		}

		let body;
		try {
			const bodyMarkdown = eval('`' + content.toString() + '`')
			body = marked(bodyMarkdown);
		} catch (err) {
			console.error(`Could not parse page ${_path}`, err);
			throw err;
		}

		const metatags = Object.entries(_meta).map(([tag, content]) => {
			tag = tag.replace(/"/g, '&quot;');
			content = content.replace(/"/g, '&quot;');
			return `<meta name="${tag}" content="${content}" />`;
		}).join('\n');
		title = _meta.title;

		const layoutPath = path.join(
			'src',
			'layouts',
			(_meta.layout || 'default')
		) + '.html';
		const layout = layouts[layoutPath];
		
		try {
			return eval('`' + layout + '`');
		} catch (err) {
			console.error(`Could not parse layout ${layoutPath}`, err);
			throw err;
		}
	}
};

module.exports = (env, argv) => {
	var devtool = 'source-map';
	if (argv.mode == 'development') {
		devtool = 'eval-cheap-source-map';
	}

	const sources = ['./src/index.js']
		.concat(glob.sync('./src/routes/**/*.js'))
	;
	const entry = sources.reduce((files, path) => {
		if (path.match(/routes/)) {
			files[path.toString().slice('./src/routes'.length)] = path;
		} else {
			files['index.js'] = path;
		}
		return files;
	}, {});

	return {
		// devServer: {
		// 	// contentBase: path.join(__dirname, 'dist'),
		// 	compress: true,
		// 	// open: true,
		// 	port: 9999,
		// 	watchContentBase: true,
		// 	liveReload: true,
		// 	hot: true
		// },
		entry,
		output: {
			filename: "[name]"
		},
		devtool,
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'static' },
					{
						from: './src/layouts/**/*.html',
						transform: CollectLayouts
					},
					{
						from: './src/routes/**/*.md',
						to: distPath({ subpathIn: 'src/routes' }),
						transform: SSG
					},
					{
						from: './src/routes/**/*.html',
						to: distPath({ subpathIn: 'src/routes' })
					},
					{
						from: './src/routes/**/*.css',
						to: distPath({ subpathIn: 'src/routes' })
						// trasform: ???
					},
					{
						from: './src/routes/**/*.png',
						to: distPath({ subpathIn: 'src/routes' })
					},
					{
						from: './src/routes/**/*.jpg',
						to: distPath({ subpathIn: 'src/routes' })
					},
					{
						from: './src/routes/**/*.json',
						to: distPath({ subpathIn: 'src/routes' })
					},
					{
						from: './src/routes/**/*.svg',
						to: distPath({ subpathIn: 'src/routes' })
					},
					{
						from: './src/routes/**/*.mp3',
						to: distPath({ subpathIn: 'src/routes' })
					},
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
