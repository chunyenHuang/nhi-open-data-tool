const csvtojson = require('csvtojson');
const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const got = require('got');
const stats = require('stats-lite');

const {
  FORCE_CREATE,
  LATEST_DIR,
} = require('./config');

const getSources = require('./getSources');
const { writeData } = require('./helpers');

const report = {
  lastUpdatedAt: null,
  metadata: {},
  logs: [],
  errors: [],
};

const getLocations = () => {
  return [
    '臺北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '苗栗縣',
    '臺中市', '彰化縣', '南投縣',
    '雲林縣', '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣',
    '宜蘭縣', '花蓮縣', '臺東縣',
    '澎湖縣', '金門縣', '連江縣'];
};

const getOrgTypes = () => {
  return ['醫學中心', '區域醫院', '地區醫院', '基層診所'];
};

(async () => {
  try {
    if (FORCE_CREATE) {
      fs.emptyDirSync(LATEST_DIR);
    }

    const sources = await getSources();

    writeData('sources.json', sources);

    const promises = sources.map(downloadAndConvertToJson);

    await Promise.all(promises);

    // copy latest to backup with timestamp
    // fs.copySync(LATEST_DIR, path.join(BACKUP_DIR, `${moment.tz(TIME_ZONE).format('YYYY-MM-DD HH:mm')}`));

    // process data
    processRatio();
    processList();
    processPCItemList();
    processPCItems();
    processNCItemList();

    processStatistics();

    report.lastUpdatedAt = moment().toISOString();

    // sort report items to make git diff cleanner
    report.metadata = Object.keys(report.metadata).sort((a, b) => a > b ? 1 : -1).reduce((obj, key) => {
      obj[key] = report.metadata[key];
      return obj;
    }, {});
    report.logs = report.logs.sort((a, b) => a > b ? 1 : -1);
    report.errors = report.errors.sort((a, b) => a > b ? 1 : -1);

    writeData('report.json', report);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

async function downloadAndConvertToJson({ name, type, url }) {
  try {
    let startedAt = Date.now();
    const cacheFilePath = path.join(LATEST_DIR, `原始資料-${name}.${type}`);
    let buffer;
    if (!fs.existsSync(cacheFilePath)) {
      const res = await got(encodeURI(url), { responseType: 'buffer' });
      buffer = res.body;
      fs.writeFileSync(cacheFilePath, buffer);
    } else {
      buffer = fs.readFileSync(cacheFilePath);
    }
    report.logs.push(`[${name}] 下載 ${Date.now()- startedAt}ms`);
    startedAt = Date.now();

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
    writeData(`原始資料-${name}.json`, jsonData);
    report.metadata[`原始資料-${name}.json`] = jsonData.length;
    report.logs.push(`[${name}] 轉換 ${Date.now()- startedAt}ms`);
  } catch (e) {
    console.log(e);
    report.errors.push(`Failed to Download & Convert: ${name} ${JSON.stringify(e.message || e)}`);
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

  writeData('自付差額特材數量佔率.json', data);
  report.metadata[`自付差額特材數量佔率.json`] = data.length;
}

// 清單
function processList() {
  const records = require(path.join(LATEST_DIR, '原始資料-自付差額特材功能材質分類說明.json'));
  const mappings = {};
  records.forEach((record) => {
    const categoryName = record['醫材'];

    mappings[categoryName] = mappings[categoryName] || {
      '名稱': categoryName,
      '子分類': [],
    };

    mappings[categoryName]['子分類'].push(record);
  });

  const categories = Object.keys(mappings)
    .sort((a, b) => a > b ? 1 : -1)
    .map((key) => mappings[key]);

  writeData('自付差額品項類別.json', categories);
  report.metadata[`自付差額品項類別.json`] = categories.length;
}

function processPCItemList() {
  const allPaidItems = require(path.join(LATEST_DIR, '原始資料-自付差額醫材對應健保全額給付品項明細.json'));
  const records = require(path.join(LATEST_DIR, '原始資料-民眾自付差額品項收費情形.json'));

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
    const cost = parseFloat(record['特約院所收費']);
    let matchedItem = items[record['品項代碼']];

    if (!matchedItem) {
      const matchedPaidItemCodes = allPaidItems
        .filter((x) => x['自付差額品項代碼'] === record['品項代碼'])
        .map((x) => x['對應健保全額給付品項代碼']);
      matchedItem = {
        '代碼': record['品項代碼'],
        '中文': record['中文名稱'],
        '英文': record['英文名稱'],
        '許可證字號': record['許可證字號'],
        '健保給付點數': record['健保給付點數'],
        '類別': record['自付差額品項類別'],
        '分類': record['自付差額品項功能分類'],
        // '最低自付差額': cost,
        // '最高自付差額': cost,
        // '最低與最高自付差額價差': 0,
        // '醫療機構數': 0,
        '對應健保全額給付品項代碼': matchedPaidItemCodes,
        '統計資料': {
          '醫療機構': {
            '總數': 0,
            '特約類別': getOrgTypes().reduce((obj, item) => {
              obj[item] = 0;
              return obj;
            }, {}),
            '地區': getLocations().reduce((obj, item) => {
              obj[item] = 0;
              return obj;
            }, {}),
          },
          '自付差額': {
            '健保給付點數': 0,
            '平均值': 0, // mean
            '中位數': 0, // median
            '眾數': 0, // mode
            '最低': 0,
            '最高': 0,
            '價差': 0,
            '列表': [],
          },
        },
      };
    }

    // count
    const location = record['就醫院所縣市別'];
    const hospitalType = record['特約類別'];
    matchedItem['統計資料']['醫療機構']['總數']++;
    // matchedItem['統計資料']['醫療機構']['地區'][location] = matchedItem['統計資料']['醫療機構']['地區'][location] || 0;
    matchedItem['統計資料']['醫療機構']['地區'][location]++;
    // matchedItem['統計資料']['醫療機構']['特約類別'][hospitalType] = matchedItem['統計資料']['醫療機構']['特約類別'][hospitalType] || 0;
    matchedItem['統計資料']['醫療機構']['特約類別'][hospitalType]++;

    // update min and max prices
    matchedItem['統計資料']['自付差額']['健保給付點數'] = record['健保給付點數'];

    matchedItem['統計資料']['自付差額']['列表'].push(cost);

    items[record['品項代碼']] = matchedItem;
  });

  allPaidItems.forEach((item) => {
    const matched = paidItems[item['對應健保全額給付品項代碼']] || {
      '代碼': item['對應健保全額給付品項代碼'],
      '名稱': item['中英文名稱'],
      '支付點數': item['支付點數'],
      '許可證字號': item['許可證字號'],
      '藥商名稱': item['藥商名稱'],
      '自付差額品項代碼': [],
    };

    matched['自付差額品項代碼'].push(item['自付差額品項代碼']);

    paidItems[item['對應健保全額給付品項代碼']] = matched;
  });

  organizations = Object.keys(organizations).map((key) => organizations[key]);
  items = Object.keys(items).map((key) => {
    const list = items[key]['統計資料']['自付差額']['列表'].sort((a, b) => a > b ? 1 : -1);
    items[key]['統計資料']['自付差額']['平均值'] = stats.mean(list);
    items[key]['統計資料']['自付差額']['中位數'] = stats.median(list);
    items[key]['統計資料']['自付差額']['眾數'] = stats.mode(list);
    items[key]['統計資料']['自付差額']['最低'] = list[0];
    items[key]['統計資料']['自付差額']['最高'] = list[list.length - 1];
    items[key]['統計資料']['自付差額']['價差'] = list[list.length - 1] - list[0];

    return items[key];
  });
  paidItems = Object.keys(paidItems).map((key) => paidItems[key]);

  writeData('醫事機構.json', organizations);
  report.metadata[`醫事機構.json`] = organizations.length;
  writeData('自付差額品項.json', items);
  report.metadata[`自付差額品項.json`] = items.length;
  writeData('自付差額醫材對應健保全額給付品項.json', paidItems);
  report.metadata[`自付差額醫材對應健保全額給付品項.json`] = paidItems.length;
}

function processNCItemList() {
  const records = require(path.join(LATEST_DIR, '原始資料-民眾全自費品項收費情形.json'));

  let items = {};

  records.forEach((record) => {
    const cost = parseFloat(record['特約院所收費']);
    let matchedItem = items[record['品項代碼']];

    if (!matchedItem) {
      matchedItem = {
        '代碼': record['品項代碼'],
        '中文': record['中文名稱'],
        '英文': record['英文名稱'],
        '許可證字號': record['許可證字號'],
        '手術及裝置': record['手術及裝置'],
        '醫材種類': record['醫材種類'],
        '未納入健保給付原因': record['未納入健保給付原因'],
        '說明': record['說明'],
        '最低自費額': cost,
        '最高自費額': cost,
        '最低與最高自付差額價差': 0,
        '醫療機構數': 0,
      };
    }

    // count
    matchedItem['醫療機構數']++;

    // update min and max prices
    if (cost < matchedItem['最低自費額']) {
      matchedItem['最低自費額'] = cost;
    }
    if (cost > matchedItem['最高自費額']) {
      matchedItem['最高自費額'] = cost;
    }

    matchedItem['最低與最高自付差額價差'] = matchedItem['最高自付差額'] - matchedItem['最低自付差額'];

    items[record['品項代碼']] = matchedItem;
  });

  items = Object.keys(items).map((key) => items[key]);

  writeData('全自費品項.json', items);
  report.metadata[`全自費品項.json`] = items.length;
}

// Split 原始資料-民眾自付差額品項收費情形.json to indexed files
function processPCItems() {
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
      writeData(path.join(dir, filename), set.cache[cacheKey]);
      report.metadata[`${dir}/${filename}`] = set.cache[cacheKey].length;
    });
  });
}

function processStatistics() {
  const markets = require(path.join(LATEST_DIR, '自付差額特材數量佔率.json'));
  const categories = require(path.join(LATEST_DIR, '自付差額品項類別.json'));
  const items = require(path.join(LATEST_DIR, '原始資料-民眾自付差額品項收費情形.json'));

  items.forEach((item) => {
    const matchedCategory = categories.find((x) => x['名稱'] === item['醫材']);
    let category;
    if (!matchedCategory) {
      category = {
        '名稱': item['自付差額品項類別'],
        '子分類': [],
      };
      categories.push(category);
    } else {
      category = matchedCategory;
    }

    const categoryStatistics = category['統計資料'] || {
      '醫療機構': {
        '總數': 0,
        '特約類別': getOrgTypes().reduce((obj, item) => {
          obj[item] = 0;
          return obj;
        }, {}),
        '地區': getLocations().reduce((obj, item) => {
          obj[item] = 0;
          return obj;
        }, {}),
        '列表': [],
      },
      '自付差額': {
        '健保給付點數': 0,
        '平均值': 0, // mean
        '中位數': 0, // median
        '眾數': 0, // mode
        '最低': 0,
        '最高': 0,
        '價差': 0,
        '列表': [],
      },
      '使用佔率': {
        '平均值': parseFloat(markets.find((x) => x['醫事機構類別'])['同儕平均值']),
      },
    };

    const cost = parseFloat(item['特約院所收費']);

    if (!categoryStatistics['醫療機構']['列表'].find((x) => x['醫事機構代碼'] === item['醫事機構代碼'])) {
      categoryStatistics['醫療機構']['列表'].push(item);
      categoryStatistics['醫療機構']['總數']++;
      // categoryStatistics['醫療機構']['特約類別'][item['特約類別']] = categoryStatistics['醫療機構']['特約類別'][item['特約類別']] || 0;
      categoryStatistics['醫療機構']['特約類別'][item['特約類別']]++;
      // categoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']] = categoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']] || 0;
      categoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']]++;

      categoryStatistics['自付差額']['健保給付點數'] = item['健保給付點數'];
      categoryStatistics['自付差額']['列表'].push(cost);
    }

    category['統計資料'] = categoryStatistics;

    // 子分類

    const matchedSubCategory = category['子分類'].find((x) => x['功能/材質分類'] === item['自付差額品項功能分類']);
    let subcategory;
    if (!matchedSubCategory) {
      subcategory = {
        '醫材': category['名稱'],
        '功能/材質分類': item['自付差額品項功能分類'],
        '功能一': '暫無資訊',
        '功能/材質分類說明': '暫無資訊',
      };
      category['子分類'].push(subcategory);
    } else {
      subcategory = matchedSubCategory;
    }

    const subcategoryStatistics = subcategory['統計資料'] || {
      '醫療機構': {
        '總數': 0,
        '特約類別': getOrgTypes().reduce((obj, item) => {
          obj[item] = 0;
          return obj;
        }, {}),
        '地區': getLocations().reduce((obj, item) => {
          obj[item] = 0;
          return obj;
        }, {}),
        '列表': [],
      },
      '自付差額': {
        '健保給付點數': 0,
        '平均值': 0, // mean
        '中位數': 0, // median
        '眾數': 0, // mode
        '最低': 0,
        '最高': 0,
        '價差': 0,
        '列表': [],
      },
    };

    if (!subcategoryStatistics['醫療機構']['列表'].find((x) => x['醫事機構代碼'] === item['醫事機構代碼'])) {
      subcategoryStatistics['醫療機構']['列表'].push(item);
      subcategoryStatistics['醫療機構']['總數']++;
      // subcategoryStatistics['醫療機構']['特約類別'][item['特約類別']] = subcategoryStatistics['醫療機構']['特約類別'][item['特約類別']] || 0;
      subcategoryStatistics['醫療機構']['特約類別'][item['特約類別']]++;
      // subcategoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']] = subcategoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']] || 0;
      subcategoryStatistics['醫療機構']['地區'][item['就醫院所縣市別']]++;

      subcategoryStatistics['自付差額']['健保給付點數'] = item['健保給付點數'];
      subcategoryStatistics['自付差額']['列表'].push(cost);
    }

    subcategory['統計資料'] = subcategoryStatistics;
  });

  writeData('自付差額品項類別.json', categories.map((x) => {
    const list = x['統計資料']['自付差額']['列表'].sort((a, b) => a > b ? 1 : -1);
    x['統計資料']['自付差額']['平均值'] = stats.mean(list);
    x['統計資料']['自付差額']['中位數'] = stats.median(list);
    x['統計資料']['自付差額']['眾數'] = stats.mode(list);
    x['統計資料']['自付差額']['最低'] = list[0];
    x['統計資料']['自付差額']['最高'] = list[list.length - 1];
    x['統計資料']['自付差額']['價差'] = list[list.length - 1] - list[0];

    delete x['統計資料']['醫療機構']['列表'];
    delete x['統計資料']['自付差額']['列表'];

    x['子分類'].forEach((subcategory) => {
      if (subcategory['統計資料']) {
        const list = subcategory['統計資料']['自付差額']['列表'].sort((a, b) => a > b ? 1 : -1);
        subcategory['統計資料']['自付差額']['平均值'] = stats.mean(list);
        subcategory['統計資料']['自付差額']['中位數'] = stats.median(list);
        subcategory['統計資料']['自付差額']['眾數'] = stats.mode(list);
        subcategory['統計資料']['自付差額']['最低'] = list[0];
        subcategory['統計資料']['自付差額']['最高'] = list[list.length - 1];
        subcategory['統計資料']['自付差額']['價差'] = list[list.length - 1] - list[0];

        delete subcategory['統計資料']['醫療機構']['列表'];
        delete subcategory['統計資料']['自付差額']['列表'];
      }
    });
    return x;
  }));
}
