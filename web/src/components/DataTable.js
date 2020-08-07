import React from 'react';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';

export default function DataTable({ title, data, columns, options }) {
  const updatedOptions = Object.assign({
    enableNestedDataAccess: '.',
    pagination: true,
    responsive: 'standard',
    rowsPerPageOptions: [5, 10, 20, 50, 100],
    rowsPerPage: 5,
    filterType: 'dropdown',
    fixedHeader: true,
    resizableColumns: false,
    selectableRows: 'none',
    print: true,
    download: true,
    downloadOptions: {
      filename: `${title}.csv`,
      separator: ',',
    },
    expandableRows: false,
    isRowExpandable: () => false,
    isRowSelectable: () => false,
    onRowClick: (rowData, rowMeta) => {
      const item = data[rowMeta.dataIndex];
      console.log(item);
    },
  }, options);

  return (
    <MUIDataTable
      title={title}
      data={data}
      columns={columns}
      options={updatedOptions}
    />
  );
}

DataTable.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  columns: PropTypes.array,
  options: PropTypes.object,
};
