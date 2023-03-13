const config = require('./config.json');

const jestConfig = {
  verbose: true,
  globals: {
    ...config
  }
};

module.exports = () => {
  return jestConfig;
};

