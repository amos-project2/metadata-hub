const path = require('path');

//const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    entry: './src/app.js',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [
                    {
                        // Adds CSS to the DOM by injecting a `<style>` tag
                        loader: 'style-loader'
                    },
                    {
                        // Interprets `@import` and `url()` like `import/require()` and will resolve them
                        loader: 'css-loader'
                    },
                    {
                        // Loader for webpack to process CSS with PostCSS
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    {
                        // Loads a SASS/SCSS file and compiles it to CSS
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.lazy\.scss3$/i,
                use: [
                    { loader: 'style-loader', options: { injectType: 'lazyStyleTag' } },
                    {loader: 'css-loader'},
                    {loader: 'sass-loader'},
                ],
            },
            {
                type: 'javascript/auto',
                test: /\.mjs$/,
                use: [],
                include: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.svg$/,
                use: [{loader: 'svg-inline-loader'}],
            },
            {
                test: /\.html$/,
                use: ['file?name=[name].[ext]'],
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.css', '.mjs'],
        alias: {
            // Force all modules to use the same jquery version.
            'jquery': path.join(__dirname, 'node_modules/jquery/src/jquery')
            }


    },
    plugins: [
        //new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })

    ],
    optimization: {

        splitChunks: {
            chunks: 'all',
        },
    },
    mode: 'development'
};
