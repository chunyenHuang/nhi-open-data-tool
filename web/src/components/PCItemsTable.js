import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import retrieve from 'utils/retrieve';
import DataTable from 'components/DataTable';
import VisitButton from 'components/VisitButton';
import { sortBy } from 'utils/sorting';
import CellImage from 'components/CellImage';
import { getPCItemImageUrl, getTextLinkHtml } from 'utils/retrieve';

export default function PCItemsTable({ prefilters = {} }) {
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
        customBodyRender: (value) => <CellImage value={getPCItemImageUrl(value)} />,
      },
    },
    {
      name: '類別',
      label: '類別',
      options: {
        filterList: prefilters['類別'] || [],
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '分類',
      label: '分類',
      options: {
        filterList: (prefilters['分類'] || []).map((x) => x.replace(/ /g, '+')),
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
      name: '健保給付點數',
      label: '健保給付點數',
      type: 'number',
      options: {
        filter: false,
      },
    },
    {
      name: '統計資料.自付差額.最低',
      label: '最低自付差額',
      type: 'number',
      options: {
        filter: false,
      },
    },
    {
      name: '統計資料.自付差額.最高',
      label: '最高自付差額',
      type: 'number',
      options: {
        filter: false,
      },
    },
    {
      name: '統計資料.自付差額.價差',
      label: '最低與最高自付差額價差',
      type: 'number',
      options: {
        filter: false,
      },
    },
    {
      name: '統計資料.醫療機構.總數',
      label: '醫療機構數',
      type: 'number',
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
        customBodyRender: (value) => (<VisitButton url={`/pcItem/${value}`} title="查看" />),
      },
    },
  ];

  return (
    <DataTable
      title="自付差額醫療特材清單"
      description={getTextLinkHtml('資料出處：健保署 民眾自付差額品項收費情形', 'https://data.nhi.gov.tw/Datasets/DatasetDetail.aspx?id=663&Mid=A110734')}
      data={data}
      columns={columns}
    />
  );
}

PCItemsTable.propTypes = {
  prefilters: PropTypes.object,
};
