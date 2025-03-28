const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const path = require('path');
const { watch } = require('fs');

module.exports = {
  mode: 'production',
  target: 'web',
  watch: true,
  entry: {
    contentScript: './src/content/index.ts',
    background: './src/background/index.ts',
    react: './src/react/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    }),
    new CopyPlugin({
      patterns: [{
        from: path.resolve('manifest.json'),
        to: path.resolve('dist')
      },
      { from: path.resolve('assets'), to: path.resolve('dist/assets') }
      ]
    }),
    new DefinePlugin({
      'process.env.GOOGLE_GEMINI_API_KEY;': JSON.stringify(process.env.GOOGLE_GEMINI_API_KEY)
    }),
  ],
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { 'runtime': 'automatic' }],
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader', // Injects styles into the DOM
          {
            loader: 'css-loader',
            options: {
              // Enable CSS Modules if needed
              // modules: true,
            },
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css']
  }
};