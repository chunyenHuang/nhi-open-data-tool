import React, { useState, useEffect } from 'react';

import retrieve, { getTextLinkHtml } from 'utils/retrieve';
import DataTable from 'components/DataTable';

export default function NCItemsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const records = await retrieve('全自費品項');
      setData(records);
    })();
  }, []);

  const columns = [
    {
      name: '手術及裝置',
      label: '手術及裝置',
      options: {
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '醫材種類',
      label: '醫材種類',
      options: {
        filterOptions: {
          fullWidth: true,
        },
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
      name: '未納入健保給付原因',
      label: '未納入健保給付原因',
      options: {
        filter: true,
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '說明',
      label: '說明',
      options: {
        filter: false,
      },
    },
    {
      name: '最低自費額',
      label: '最低自費額',
      options: {
        filter: false,
      },
    },
    {
      name: '最高自費額',
      label: '最高自費額',
      options: {
        filter: false,
      },
    },
    {
      name: '醫療機構數',
      label: '醫療機構數',
      options: {
        filter: false,
      },
    },
  ];

  return (
    <DataTable
      title="全自費品項清單"
      description={getTextLinkHtml('資料出處：健保署 民眾全自費品項收費情形', 'https://data.nhi.gov.tw/Datasets/DatasetDetail.aspx?id=662&Mid=A110734')}
      data={data}
      columns={columns}
    />
  );
}

NCItemsTable.propTypes = {};
