import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import retrieve from 'utils/retrieve';
import DataTable from 'components/DataTable';
import { sortBy } from 'utils/sorting';

export default function PCItemPricesInAllOrgsTable({ id }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const records = await retrieve(`自付差額品項收費/品項代碼/${id}`);
      if (!records[0]) return;
      setData(records.sort(sortBy('特約院所收費')));
    })();
  }, [id]);

  const columns = [
    {
      name: '分區業務組',
      label: '分區業務組',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: '就醫院所縣市別',
      label: '地區',
      options: {
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '特約類別',
      label: '特約類別',
      options: {
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '醫事機構名稱',
      label: '醫事機構名稱',
      options: {
        filterOptions: {
          fullWidth: true,
        },
      },
    },
    {
      name: '醫事機構簡稱',
      label: '醫事機構簡稱',
      options: {
        filter: false,
        display: false,
      },
    },
    {
      name: '醫事機構代碼',
      label: '醫事機構代碼',
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
        display: false,
      },
    },
    {
      name: '特約院所收費',
      label: '自付差額',
      options: {
        filter: false,
      },
    },
  ];

  return (
    <DataTable
      title="各地區機構特材收費"
      data={data}
      columns={columns}
    />
  );
}

PCItemPricesInAllOrgsTable.propTypes = {
  id: PropTypes.string,
};
