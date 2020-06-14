const path = require('path');

const webpack = require('webpack')

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'app.bundle.js',
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
                    // {
                    //     // Loader for webpack to process CSS with PostCSS
                    //     loader: 'postcss-loader',
                    //     options: {
                    //         plugins: function () {
                    //             return [
                    //                 require('precss'),
                    //                 require('autoprefixer')
                    //             ];
                    //         }
                    //     }
                    // },
                    {
                        // Loads a SASS/SCSS file and compiles it to CSS
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.lazy\.scss3$/i,
                use: [
                    {loader: 'style-loader', options: {injectType: 'lazyStyleTag'}},
                    {loader: 'css-loader'},
                    {loader: 'sass-loader'},
                ],
            },

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
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.DllReferencePlugin({
            // context: '.',
            manifest: require(path.resolve(__dirname, 'dist/vendor-manifest.json')),
        })

    ],

    mode: 'development'
};
