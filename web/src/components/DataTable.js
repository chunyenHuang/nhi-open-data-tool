import React from 'react';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';

import TableFooter from './TableFooter';

const useStyles = makeStyles((theme) => ({
  number: {},
}));


export default function DataTable({ title, description, data, columns, options }) {
  const classes = useStyles();

  const updatedOptions = Object.assign({
    enableNestedDataAccess: '.',
    pagination: true,
    responsive: 'standard',
    rowsPerPageOptions: [10, 20, 50, 100],
    rowsPerPage: 10,
    filterType: 'multiselect',
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
    textLabels: {
      body: {
        noMatch: '抱歉，找不到相關資料',
        toolTip: '排序',
        columnHeaderTooltip: (column) => `使用[${column.label}]排序`,
      },
      pagination: {
        next: '下一頁',
        previous: '上一頁',
        rowsPerPage: '每頁顯示',
        displayRows: '總項目數',
      },
      toolbar: {
        search: '搜尋',
        downloadCsv: '下載 CSV',
        print: '列印',
        viewColumns: '顯示欄位',
        filterTable: '篩選數據',
      },
      filter: {
        all: '全部',
        title: '篩選數據',
        reset: '重設',
      },
      viewColumns: {
        title: '欄位',
        titleAria: '顯示/隱藏欄位',
      },
      // selectedRows: {
      //   text: 'row(s) selected',
      //   delete: 'Delete',
      //   deleteAria: 'Delete Selected Rows',
      // },
    },
    customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
      return (
        <TableFooter
          description={description}
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          changeRowsPerPage={changeRowsPerPage}
          changePage={changePage}
          textLabels={textLabels} />
      );
    },
  }, options);

  columns
    .map((column, index) => {
      if (!Object.prototype.hasOwnProperty.call(column, 'options')) {
        column.options = {};
      }
      return column;
    })
    .forEach(({ name, edit, type, options = {} }) => {
      switch (type) {
      case 'actions':
        break;
      case 'datetime':
        options.customBodyRender = (value) => value ? moment(value).format('YYYY/MM/DD h:mm a') : '';
        break;
        // case 'checkbox':
        //   options.customBodyRender = (value) => {
        //     const isChecked = (value == 'true' || value === 'yes' || value === true) ? true : false;
        //     return (<Checkbox checked={isChecked} />);
        //   };
        //   break;
      case 'number':
        options.customBodyRender = (val) => (
          <div className={classes.number}>
            {new Intl.NumberFormat().format(val)}
          </div>
        );
        break;
      case 'boolean':
        options.customBodyRender = (val) => val ? 'yes' : 'no';
        break;
      default:
        options.customBodyRender = options.customBodyRender || ((val) => val ? val : null);
        break;
      }
    });

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
  description: PropTypes.string,
  data: PropTypes.array,
  columns: PropTypes.array,
  options: PropTypes.object,
};
