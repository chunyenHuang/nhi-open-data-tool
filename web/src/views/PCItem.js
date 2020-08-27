import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import DocumentTitle from 'react-document-title';

import retrieve, { getPCItemImageUrl } from 'utils/retrieve';
import PCItemPricesInAllOrgsTable from 'components/PCItemPricesInAllOrgsTable';
import SameFunctionPCItemsTable from 'components/SameFunctionPCItemsTable';
import MatchedAllOfferedPCItemsTable from 'components/MatchedAllOfferedPCItemsTable';
import Statistics from 'components/Statistics';
import { certificateLinkRender } from 'components/table/renders';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing(4),
  },
  statisticsContainer: {
    padding: theme.spacing(4),
  },
  space: {
    height: theme.spacing(4),
  },
  img: {
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing(1),
  },
}));

export default function Item({ id: inId, match }) {
  const classes = useStyles();
  const [id, setId] = useState();
  const [item, setItem] = useState();
  // const [category, setCategory] = useState();
  const [subcategory, setSubcategory] = useState({});

  useEffect(() => {
    if (inId) {
      setId(inId);
    } else
    if (match) {
      const { params: { id } } = match;
      setId(id);
    }
  }, [inId, match]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const allItems = await retrieve('自付差額品項');
      const matched = allItems.find((x) => x['代碼'] === id);
      if (!matched) {
        // error?
      }
      console.log(matched);
      setItem(matched);

      const categories = (await retrieve('自付差額品項類別'));
      categories.forEach((category) => {
        if (category['名稱'] === matched['類別']) {
          // setCategory(category);
          category['子分類'].forEach((subcategory) => {
            if (subcategory['自付差額品項功能分類'] === matched['分類']) {
              console.log(subcategory);
              setSubcategory(subcategory);
            }
          });
        }
      });
    })();
  }, [id]);

  if (!item) return null;

  return (
    <DocumentTitle title={`${item['中文']}`}>
      <div>
        <Paper>
          <Grid container>
            <Grid container item xs={12} sm={2} md={4} alignItems="center" justify="center" className={classes.container}>
              <img src={getPCItemImageUrl(id)} alt="test" className={classes.img}/>
            </Grid>
            <Grid item xs={12} sm={10} md={8} className={classes.container}>
              <Typography variant="h5" component="h1" className={classes.header}>
                {item['中文']}
              </Typography>
              <Typography variant="subtitle1" component="h5" className={classes.header}>
                {item['英文']}
              </Typography>
              <Typography variant="body2" component="p" className={classes.header}>
                代碼：{item['代碼']}
              </Typography>
              <Typography variant="body2" component="p" className={classes.header}>
                {/* TODO: link */}
                類別：{item['類別']} / {item['分類']}
              </Typography>
              <Typography variant="body2" component="p" className={classes.header}>
                許可證字號：{certificateLinkRender(item['許可證字號'], 'body1')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        <div className={classes.space} />
        <Paper className={classes.statisticsContainer}>
          <Statistics
            data={item['統計資料']}
            compareData={subcategory['統計資料']}
          />
        </Paper>
        <div className={classes.space} />
        <PCItemPricesInAllOrgsTable id={id}/>
        <div className={classes.space} />
        <SameFunctionPCItemsTable id={id} funcName={item['分類']} />
        <div className={classes.space} />
        <MatchedAllOfferedPCItemsTable id={id} />
      </div>
    </DocumentTitle>
  );
}

Item.propTypes = {
  id: PropTypes.string,
  match: PropTypes.object,
};
