module.exports = {
    entry: "./built/ui/app.js",
    output: {
      filename: "bundle.js"
    },
    target: 'web',
    // type: 'javascript/auto',
    // test: /\.(json)$/,
    // exclude: /node_modules/,
    // loader: [
    //   `file-loader?publicPath=./&name=[name].[ext]`
    // ],
    // {
    //   test: /\.(jpg|jpeg|gif|png)$/,
    //   // exclude: /node_modules/, <-- Delete this line
    //   loader: [
    //   `url-loader?limit=4112&publicPath=./&name=[name].[ext]`
    //   ]
    // }
    externals: {
      // '@tensorflow/tfjs': '@tensorflow/tfjs',
      // '@tensorflow/tfjs-node': '@tensorflow/tfjs-node',
      'canvas': 'canvas'
    },
    module: {
      rules: [
        {
          type: 'javascript/auto',
          test: /\.(json)$/,
          exclude: /node_modules/,
          use: [
            { loader: `file-loader?publicPath=./&name=[name].[ext]` },
            // {
            //   loader: 'css-loader',
            //   options: {
            //     modules: true
            //   }
            // },
            // { loader: 'sass-loader' }
          ]
        },
        {
          test: /\.(jpg|jpeg|gif|png)$/,
          // exclude: /node_modules/,
          loader: [
            `url-loader?limit=4112&publicPath=./dist/&name=[name].[ext]`
          ]
        },
        {
          type: 'javascript/auto',
          test: /\.(json)$/,
          exclude: /node_modules/,
          loader: [
            `file-loader?publicPath=./dist/&name=[name].[ext]`
          ]
        },
      ]
    }
  }