const csvtojson = require('csvtojson');
const fetch = require('node-fetch');
const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const {
  FORCE_CREATE,
  LATEST_DIR,
  // BACKUP_DIR,
  SOURCES,
  // TIME_ZONE,
} = require('./config');

const report = {
  lastUpdatedAt: null,
  logs: [],
  metadata: {},
  errors: [],
};

(async () => {
  if (FORCE_CREATE) {
    fs.emptyDirSync(LATEST_DIR);
  }

  const promises = SOURCES
    .filter(({ disabled }) => !disabled)
    .map(downloadAndConvertToJson);

  await Promise.all(promises);

  // copy latest to backup with timestamp
  // fs.copySync(LATEST_DIR, path.join(BACKUP_DIR, `${moment.tz(TIME_ZONE).format('YYYY-MM-DD HH:mm')}`));

  // process data
  processRatio();
  processList();
  processItems();

  report.lastUpdatedAt = moment().toISOString();
  fs.writeFileSync(path.join(LATEST_DIR, `report.json`), JSON.stringify(report, null, 2));
})();

async function downloadAndConvertToJson({ name, type, url }) {
  try {
    const startedAt = Date.now();
    const cacheFilePath = path.join(LATEST_DIR, `原始資料-${name}.${type}`);
    let buffer;
    if (!fs.existsSync(cacheFilePath)) {
      const res = await fetch(url);
      buffer = await res.buffer();
      fs.writeFileSync(cacheFilePath, buffer);
    } else {
      buffer = fs.readFileSync(cacheFilePath);
    }
    let jsonData;
    if (type === 'csv') {
      jsonData = await csvtojson().fromString(buffer.toString());
    } else {
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
      });
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        range: 0,
      });
    }
    fs.writeFileSync(path.join(LATEST_DIR, `原始資料-${name}.json`), JSON.stringify(jsonData));
    report.metadata[`原始資料-${name}.json`] = jsonData.length;
    report.logs.push(`Download & Convert: ${name} ${Date.now()- startedAt}ms`);
  } catch (e) {
    report.errors.push(`Failed to Download & Convert: ${name}`);
    report.errors.push(e.message || e);
  }
}

function processRatio() {
  // 合併佔率
  const data = [];
  fs.readdirSync(LATEST_DIR)
    .filter((x) => x.startsWith('原始資料-自付差額特材數量佔率-') && x.endsWith('.json'))
    .forEach((file) => {
      const records = require(path.join(LATEST_DIR, file));
      records.forEach((record) => {
        record['醫事機構類別'] = file.split('-')[1].replace('.json', '');
        record['自付差額品項類別'] = record['就自付差額項目'];
        delete record['就自付差額項目'];
        data.push(record);
      });
    });

  fs.writeFileSync(path.join(LATEST_DIR, '自付差額特材數量佔率.json'), JSON.stringify(data, null, 2));
  report.metadata[`自付差額特材數量佔率.json`] = data.length;
}

// 清單
function processList() {
  const categories = [];

  let records = require(path.join(LATEST_DIR, '原始資料-自付差額特材功能分類說明.json'));
  records.forEach((record) => {
    if (!categories.includes(record['自付差額品項類別'])) {
      categories.push(record['自付差額品項類別']);
    }
  });

  fs.writeFileSync(path.join(LATEST_DIR, '自付差額品項類別.json'), JSON.stringify(categories, null, 2));
  report.metadata[`自付差額品項類別.json`] = categories.length;
  fs.writeFileSync(path.join(LATEST_DIR, '自付差額特材功能分類.json'), JSON.stringify(records, null, 2));
  report.metadata[`自付差額特材功能分類.json`] = records.length;

  const allPaidItems = require(path.join(LATEST_DIR, '原始資料-自付差額醫材對應健保全額給付品項明細.json'));

  records = require(path.join(LATEST_DIR, '原始資料-民眾自付差額品項收費情形.json'));

  let organizations = {};
  let items = {};
  let paidItems = {};

  records.forEach((record) => {
    if (!organizations[record['醫事機構代碼']]) {
      organizations[record['醫事機構代碼']] = {
        '代碼': record['醫事機構代碼'],
        '名稱': record['醫事機構名稱'],
        '簡稱': record['醫事機構簡稱'],
        '類別': record['特約類別'],
        '地區': record['就醫院所縣市別'],
      };
    }
    if (!items[record['品項代碼']]) {
      const matchedPaidItemCodes = allPaidItems
        .filter((x) => x['自付差額品項代碼'] === record['品項代碼'])
        .map((x) => x['對應健保全額給付品項代碼']);
      items[record['品項代碼']] = {
        '代碼': record['品項代碼'],
        '中文': record['中文名稱'],
        '英文': record['英文名稱'],
        '許可證字號': record['許可證字號'],
        '健保給付點數': record['健保給付點數'],
        '類別': record['自付差額品項類別'],
        '分類': record['自付差額品項功能分類'],
        '最低自付差額': record['特約院所收費'],
        '最高自付差額': record['特約院所收費'],
        '對應健保全額給付品項代碼': matchedPaidItemCodes,
      };
    }
    // update min and max prices
    if (record['特約院所收費'] < items[record['品項代碼']]['最低自付差額']) {
      items[record['品項代碼']]['最低自付差額'] = record['特約院所收費'];
    }
    if (record['特約院所收費'] > items[record['品項代碼']]['最高自付差額']) {
      items[record['品項代碼']]['最高自付差額'] = record['特約院所收費'];
    }
  });

  allPaidItems.forEach((item) => {
    paidItems[item['對應健保全額給付品項代碼']] = paidItems[item['對應健保全額給付品項代碼']] || {
      '代碼': item['對應健保全額給付品項代碼'],
      '名稱': item['中英文名稱'],
      '支付點數': item['支付點數'],
      '許可證字號': item['許可證字號'],
      '藥商名稱': item['藥商名稱'],
      '自付差額品項代碼': [],
    };

    paidItems[item['對應健保全額給付品項代碼']]['自付差額品項代碼'].push(item['自付差額品項代碼']);
  });

  organizations = Object.keys(organizations).map((key) => organizations[key]);
  items = Object.keys(items).map((key) => items[key]);
  paidItems = Object.keys(paidItems).map((key) => paidItems[key]);

  fs.writeFileSync(path.join(LATEST_DIR, '醫事機構.json'), JSON.stringify(organizations, null, 2));
  report.metadata[`醫事機構.json`] = organizations.length;
  fs.writeFileSync(path.join(LATEST_DIR, '自付差額品項.json'), JSON.stringify(items, null, 2));
  report.metadata[`自付差額品項.json`] = items.length;
  fs.writeFileSync(path.join(LATEST_DIR, '自付差額醫材對應健保全額給付品項.json'), JSON.stringify(paidItems, null, 2));
  report.metadata[`自付差額醫材對應健保全額給付品項.json`] = paidItems.length;
}

// Split 原始資料-民眾自付差額品項收費情形.json to indexed files
function processItems() {
  const records = require(path.join(LATEST_DIR, '原始資料-民眾自付差額品項收費情形.json'));

  const sets = [
    {
      name: '地區',
      key: '就醫院所縣市別',
    },
    {
      name: '醫事機構',
      key: '醫事機構名稱',
    },
    {
      name: '類別',
      key: '自付差額品項類別',
    },
    {
      name: '功能分類',
      key: '自付差額品項功能分類',
    },
    {
      name: '品項代碼',
      key: '品項代碼',
    },
  ].map((x) => {
    x.cache = {};
    return x;
  });

  const assign = (item, key, obj) => {
    obj[item[key]] = obj[item[key]] || [];
    obj[item[key]].push(item);
  };

  records.forEach((record) => {
    sets.forEach((set) => {
      assign(record, set.key, set.cache);
    });
  });

  // 自付差額品項收費
  const prefix = '自付差額品項收費';
  sets.forEach((set) => {
    Object.keys(set.cache).forEach((cacheKey) => {
      const dir = `${prefix}/${set.name}`;
      const filename = `${cacheKey || '無'}.json`;
      fs.ensureDirSync(path.join(LATEST_DIR, dir));
      fs.writeFileSync(path.join(LATEST_DIR, dir, filename), JSON.stringify(set.cache[cacheKey], null, 2));
      report.metadata[`${dir}/${filename}`] = set.cache[cacheKey].length;
    });
  });
}
