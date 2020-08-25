import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import retrieve from 'utils/retrieve';
import DataTable from 'components/DataTable';
import { sortBy } from 'utils/sorting';
import CellImage from 'components/CellImage';
import { getPCItemImageUrl } from 'utils/retrieve';

export default function MatchedAllOfferedPCItemsTable({ id }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const allItems = await retrieve('自付差額醫材對應健保全額給付品項');
      setData(allItems.filter((x) => x['自付差額品項代碼'].includes(id)).sort(sortBy('支付點數', true)));
    })();
  }, [id]);

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
      name: '代碼',
      label: '代碼',
      options: {
        filter: false,
      },
    },
    {
      name: '名稱',
      label: '名稱',
      options: {
        filter: false,
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
      name: '藥商名稱',
      label: '藥商名稱',
    },
    {
      name: '支付點數',
      label: '健保給付點數',
      type: 'number',
      options: {
        filter: false,
      },
    },
  ];

  return (
    <DataTable
      title={`對應健保全額給付品項`}
      data={data}
      columns={columns}
    />
  );
}

MatchedAllOfferedPCItemsTable.propTypes = {
  id: PropTypes.string,
};
