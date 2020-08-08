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

export const getItemImageUrl = (id) => {
  return `https://www.nhi.gov.tw/Query4Pic/${id}.jpg`;
};

export const getTextLinkHtml = (label, url) => {
  return `<a href="${url}" rel="noopener" target="blank" style="none;">${label}</a>`;
};
