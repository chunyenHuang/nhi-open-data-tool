import Dexie from 'dexie';

const db = new Dexie('nhi-open-data-tool');
db.version(1).stores({
  cache: '++id,key',
});

let TTLBaseline = Date.now();
const TTL = 6 * 3600 * 1000; // 6 hours

export default {
  setTTLBaseline(value) {
    TTLBaseline = value;
  },
  get: async (key) => {
    const cache = await db.table('cache').where({ key }).toArray();
    if (cache.length === 0) {
      return;
    }

    if (!cache[0].expiredAt || cache[0].expiredAt < Date.now()) {
      return;
    }

    return cache[0].data;
  },

  set: async (key, data) => {
    const cache = await db.table('cache').where({ key }).toArray();
    const expiredAt = new Date(TTLBaseline).getTime() + TTL;
    if (cache.length === 0) {
      await db.table('cache').add({ key, data, expiredAt });
    } else {
      await db.table('cache').update(cache[0].id, { key, data, expiredAt });
    }
  },
};
