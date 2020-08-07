import React, { useState, useEffect } from 'react';

import retrieve from 'utils/retrieve';
import DataTable from 'components/DataTable';
import VisitButton from 'components/VisitButton';
import { sortBy } from 'utils/sorting';
import CellImage from 'components/CellImage';
import { getItemImageUrl } from 'utils/retrieve';

export default function ItemsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const records = await retrieve('自付差額品項');
      setData(records.sort(sortBy('中文')).sort(sortBy('分類')).sort(sortBy('類別')));
    })();
  }, []);

  const columns = [
    {
      name: '代碼',
      label: '圖片',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => <CellImage value={getItemImageUrl(value)} />,
      },
    },
    {
      name: '類別',
      label: '類別',
    },
    {
      name: '分類',
      label: '分類',
    },
    {
      name: '代碼',
      label: '代碼',
      options: {
        filter: false,
      },
    },
    {
      name: '中文',
      label: '中文',
      options: {
        filter: false,
      },
    },
    {
      name: '英文',
      label: '英文',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: '許可證字號',
      label: '許可證字號',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: '健保給付點數',
      label: '健保給付點數',
      options: {
        filter: false,
      },
    },
    {
      name: '最低自付差額',
      label: '最低自付差額',
      options: {
        filter: false,
      },
    },
    {
      name: '最高自付差額',
      label: '最高自付差額',
      options: {
        filter: false,
      },
    },
    {
      name: '代碼',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => (<VisitButton url={`/item/${value}`} title="查看" target="_blank" />),
      },
    },
  ];

  return (
    <DataTable
      title="全部自付差額醫療特材"
      data={data}
      columns={columns}
    />
  );
}

ItemsTable.propTypes = {};
