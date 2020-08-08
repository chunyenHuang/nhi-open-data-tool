import Home from 'views/Home';
import PCItems from 'views/PCItems';
import PCItem from 'views/PCItem';
import NCItems from 'views/NCItems';

export default [
  {
    title: '首頁',
    documentTitle: '', // use app name
    path: '/',
    exact: true,
    component: Home,
    // hideFromMenu: true,
  },
  {
    title: '自付差額品項清單',
    path: '/pcItems', // partially covered items
    exact: true,
    component: PCItems,
    hideFromMenu: false,
  },
  {
    title: '全自費品項清單',
    path: '/ncItems', // non covered items
    exact: true,
    component: NCItems,
    hideFromMenu: false,
  },
  {
    title: '',
    path: '/pcItem/:id',
    exact: true,
    component: PCItem,
    hideFromMenu: true,
  },
].map((item) => {
  item.documentTitle = item.documentTitle || item.title;
  return item;
});
