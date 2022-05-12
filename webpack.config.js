const path = require('path')
const HTMLWebpackOlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
console.log ('IS DEV:', isDev)

const optimization = () => {
	const config = {
		splitChunks: {
			chunks:	'all'
		}
	}
	if (isProd) {
		config.minimizer = [
		new OptimizeCssAssetPlugin(),
		new	TerserWebpackPlugin()
		]
	}
	return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const	cssLoaders = extra => {
	const loaders = [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								hmr: isDev, 
								reloadAll: true
							},	
						},
				'css-loader',
				{
          loader: 'postcss-loader',
          options: { sourceMap: true, config: { path: 'postcss.config.js' } }
        }
	]

	if (extra) {
		loaders.push (extra)
	}

	return loaders
}

const babelOptions = preset => {  
	const opts = {
		presets: [
			'@babel/preset-env'
		],
		plugins: [
			'@babel/plugin-proposal-class-properties'
		]
	}

	if (preset) {
		opts.presets.push(preset)
	}

	return opts
}

const jsLoaders = () => {
	const loaders = [{
		loader: 'babel-loader',
		options: babelOptions()
	}]

	if (isDev) {
		loaders.push('eslint-loader')
	}

	return loaders
}

const	plugins = () => {
	const base = [					
		new HTMLWebpackOlugin({
			title: 'Webpack',      
			template: './index.html',
			minify: { 					
				collapseWhitespace: isProd,
			}
		}),
		new CleanWebpackPlugin(),	
		new MiniCssExtractPlugin({
			filename: filename('css') 
		}),
		new	CopyWebpackPlugin({	
			patterns: [		
				{
					from: path.resolve(__dirname, 'src/favicon.ico'),
					to: path.resolve(__dirname, 'dist')
				},
				{
					from: path.resolve(__dirname, 'src/assets/img'),
					to: path.resolve(__dirname, 'dist')
				}		
			]
		}),
	]

	if (isProd) {
		base.push(new BundleAnalyzerPlugin())
	}

	return base
} 

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './index.js']
	},
	output: {        			                    
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.js', '.json', '.png'], 
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},	
	plugins: plugins(),
	optimization: optimization(),
	devServer: { 
		port: 4200,
		hot: isDev
	},
	devtool: isDev ? 'source-map' : '',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders() 
			},
			{
				test: /\.s[ac]ss$/, 
				use: cssLoaders('sass-loader') 
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use: ['file-loader']
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: ['file-loader']
			},
			{ 
				test: /\.js$/, 
				exclude: /node_modules/, 
				use: jsLoaders()
			},										
		]
	}
}