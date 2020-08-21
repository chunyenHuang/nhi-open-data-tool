import cache from './cache';

const API_URL = `https://raw.githubusercontent.com/chunyenHuang/nhi-open-data-tool/master/data/latest`;

export default async function retrieve(path, options = {}) {
  const { bypassCache = false } = options;
  path = path.endsWith('.json') ? path : `${path}.json`;
  const cacheKey = `api:${path}`;
  const cachedData = await cache.get(cacheKey);
  if (!bypassCache && cachedData) {
    return cachedData;
  }

  const res = await fetch(`${API_URL}/${path}`);
  const output = await res.json();

  console.log(output);

  await cache.set(cacheKey, output);

  return output;
}

export const getPCItemImageUrl = (id) => {
  return `https://www.nhi.gov.tw/Query4Pic/${id}.jpg`;
};

export const getTextLinkHtml = (label, url) => {
  return `<a href="${url}" rel="noopener" target="_blank" style="none;">${label}</a>`;
};

export const getCertificateLinkUrl = (code) => {
  return `http://www.fda.gov.tw/MLMS/H0001D.aspx?Type=Lic&LicId=06${code}`;
};

export const getPCItemDetails = async (id) => {
  const url = `http://www.nhi.gov.tw/QueryN/Query4.aspx?n=B2A92523DCC12607&sms=36A0BB334ECB4011&topn=3185A4DF68749BA9&upn=219B112AF4D47148&ctl00%24ContentPlaceHolder1%24tbxQ4ID=${id}`;
  console.log(url);

  const res = await fetch(url);
  console.log(res);
  const output = await res.json();

  return output;
};
