const path = require('path');

//const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    entry: ["jquery",
        "bootstrap",
        "bootstrap/scss/bootstrap.scss",
        "react",
        "react-dom",
        "graphiql",
        "graphiql/graphiql.min.css",
        "js-sha256",
        "darkreader",
        "bootstrap-autocomplete",
    ],
   // devtool: 'inline-source-map',
    output: {
        filename: 'vendor.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'vendor_lib'
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
        }),
        new webpack.DllPlugin({
            name: 'vendor_lib',
            path: path.resolve(__dirname, 'dist/vendor-manifest.json'),
        })

    ],

    mode: 'development'
};
