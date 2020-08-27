import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import retrieve from 'utils/retrieve';
import PCItemsTriageCategoryItem from 'components/PCItemsTriageCategoryItem';
import { sortBy } from 'utils/sorting';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: theme.spacing(3),
    // backgroundColor: theme.palette.background.paper,
    display: 'flex',
    // height: 224,
  },
  tabContainer: {
    width: '100%',
    // height: 600,
    // overflow: 'scroll',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minWidth: 250,
  },
}));


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};


export default function PCItemsTriage() {
  const classes = useStyles();

  const [categories, setCategories] = useState([]);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    (async () => {
      const data = (await retrieve('自付差額品項類別')).sort(sortBy('名稱'));
      console.log(data);
      setCategories(data);
    })();
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h5" component="h1">
        請問有哪些健保給付的醫療特材類別，我可以“自付差額”來選用其他的品項？
      </Typography>

      <div className={classes.container}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="自付差額分類"
          className={classes.tabs}
        >
          {categories.map((item, index)=>(
            <Tab label={item['名稱']} key={index} id={`vertical-tab-${index}`} aria-controls={`vertical-tabpanel-${index}`} />
          ))}
        </Tabs>
        <div className={classes.tabContainer}>
          {categories.map((item, index)=>(
            <TabPanel value={value} index={index} key={index}>
              <PCItemsTriageCategoryItem
                category={item}
              />
            </TabPanel>
          ))}
        </div>
      </div>


      {/* <Typography variant="h5" component="h6">
        小明想使用不同於健保給付的品項(ex: 維州-豪雅預載式單片型人工水晶體)，想選用 "博士倫"優視非球面人工水晶體:非球面軟式人工水晶體
      </Typography> */}
    </div>);
}
