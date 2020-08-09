const fs = require('fs-extra');
const path = require('path');

const {
  LATEST_DIR,
} = require('./config');

const sortByKey = (key, reverse = false) => {
  return (a, b) => {
    // equal items sort equally
    if (a[key] === b[key]) {
      return 0;
    } else
    if (a[key] === void(0)) {
      return 1;
    } else
    if (b[key] === void(0)) {
      return -1;
    } else
    if (!reverse) {
      // otherwise, if we're ascending, lowest sorts first
      return a[key] < b[key] ? -1 : 1;
    } else {
      // if descending, highest sorts first
      return a[key] < b[key] ? 1 : -1;
    }
  };
};

const sorting = (a, b) => a > b ? 1 : -1;

module.exports = {
  writeData(filename, data) {
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === 'string') {
        data = data.sort(sorting);
      } else {
        try {
          // sort all keys to reduce git diff
          const sortedKeys = Object.keys(data[0]).sort(sorting);
          sortedKeys.forEach((key) => {
            data = data.sort(sortByKey(key));
          });
        } catch (e) {
          console.log(filename, e);
        }
      }
    }

    fs.writeFileSync(path.join(LATEST_DIR, filename), JSON.stringify(data, null, 2));
  },
};
