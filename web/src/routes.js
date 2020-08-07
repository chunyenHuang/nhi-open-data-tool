import Home from 'views/Home';
import Item from 'views/Item';

export default [{
  title: '首頁',
  path: '/',
  exact: true,
  component: Home,
  hideFromMenu: false,
}, {
  title: '',
  path: '/item/:id',
  exact: true,
  component: Item,
  hideFromMenu: true,
}];
