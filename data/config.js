const fs = require('fs-extra');
const path = require('path');

const sources = require('./sources.json');
const latestDir = path.join(__dirname, 'latest');
const backupDir = path.join(__dirname, 'backup');

fs.ensureDirSync(latestDir);
fs.ensureDirSync(backupDir);

module.exports = {
  FORCE_CREATE: (process.env.FORCE_CREATE) ? true : false,
  LATEST_DIR: latestDir,
  BACKUP_DIR: backupDir,
  SOURCES: sources,
  TIME_ZONE: 'Asia/Taipei',
};
