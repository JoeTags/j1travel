const Dotenv = require('dotenv-webpack');
module.exports = {
  module: {
    plugins: [new Dotenv()],
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
};
