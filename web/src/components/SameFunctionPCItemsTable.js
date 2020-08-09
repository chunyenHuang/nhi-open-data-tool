import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import retrieve from 'utils/retrieve';
import DataTable from 'components/DataTable';
import VisitButton from 'components/VisitButton';
import { sortBy } from 'utils/sorting';
import CellImage from 'components/CellImage';
import { getItemImageUrl } from 'utils/retrieve';

export default function SameFunctionPCItemsTable({ funcName, id }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!funcName) return;

    (async () => {
      const allItems = await retrieve('自付差額品項');
      setData(allItems.filter((x) => x['分類'] === funcName).sort(sortBy('最低自付差額')));
    })();
  }, [funcName]);

  const columns = [
    {
      name: '代碼',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => value === id ? '本頁產品' : '',
      },
    },
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
        customBodyRender: (value) => (<VisitButton url={`/item/${value}`} title="查看" />),
      },
    },
  ];

  return (
    <DataTable
      title={`相同功能分類：${funcName}`}
      data={data}
      columns={columns}
    />
  );
}

SameFunctionPCItemsTable.propTypes = {
  funcName: PropTypes.string,
  id: PropTypes.string,
};
