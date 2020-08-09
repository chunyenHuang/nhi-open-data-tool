const puppeteer = require('puppeteer');

// 醫材比價網
const BASE_URL = 'https://data.nhi.gov.tw/Datasets';

const config = {
  executablePath: process.env.PUPPETEER_EXEC_PATH,
  headless: true,
  args: ['--no-sandbox'],
};

async function getSources() {
  const browser = await puppeteer.launch(config);
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/DatasetList.aspx?c=34`);

  const data = await page.$$eval('.table_result tbody tr td', (tds) => tds.map((td) => {
    const string = td.innerHTML;
    const [viewPath, url] = string.match(/href="([^"]*)"/g).map((item) => {
      return item.match(/href="([^"]*)"/)[1].replace(/amp;/g, '');
    });
    return {
      name: string.match(/title="([^"]*)"/)[1],
      url,
      viewPath,
      type: url.endsWith('ods') ? 'ods' : 'csv',
      downloadCount: parseInt(string.match(/下載次數:(\d+)/)[1]),
      viewCount: parseInt(string.match(/瀏覽次數:(\d+)/)[1]),
    };
  }));

  await browser.close();

  const sources = data.map((x) => {
    x.viewUrl = `${BASE_URL}/${x.viewPath}`;
    delete x.viewPath;
    return x;
  });

  return sources;
}

module.exports = getSources;
