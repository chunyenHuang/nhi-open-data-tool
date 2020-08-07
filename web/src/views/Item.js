import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import DocumentTitle from 'react-document-title';

import retrieve, { getItemImageUrl } from 'utils/retrieve';
import ItemPricesInAllOrgsTable from 'components/ItemPricesInAllOrgsTable';
import SameFunctionItemsTable from 'components/SameFunctionItemsTable';
import MatchedAllOfferedItemsTable from 'components/MatchedAllOfferedItemsTable';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  space: {
    height: theme.spacing(4),
  },
}));

export default function Item({ id: inId, match }) {
  const classes = useStyles();
  const [id, setId] = useState();
  const [item, setItem] = useState();

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
    })();
  }, [id]);

  if (!item) return null;

  return (
    <DocumentTitle title={`${item['中文']}`}>
      <div className={classes.container}>
        <Grid container>
          <Grid container item xs={12} sm={2} md={4} alignItems="center" justify="center">
            <img src={getItemImageUrl(id)} alt="test" />
          </Grid>
          <Grid item xs={12} sm={10} md={8}>
            <Typography variant="h5" component="h1">
              {item['中文']}
            </Typography>
            <Typography variant="subtitle1" component="h5">
              {item['英文']}
            </Typography>
            <Typography variant="body2" component="p">
              代碼：{item['代碼']}
            </Typography>
            <Typography variant="body2" component="p">
              {/* TODO: link */}
              類別：{item['類別']} / {item['分類']}
            </Typography>
            <Typography variant="body2" component="p">
              許可證字號：{item['許可證字號']}
            </Typography>
            <Typography variant="body2" component="p">
              健保給付點數：{item['健保給付點數']}
            </Typography>
            <Typography variant="body2" component="p">
              自付差額範圍：{item['最低自付差額']} - {item['最高自付差額']}
            </Typography>
          </Grid>
        </Grid>
        <div className={classes.space} />
        <ItemPricesInAllOrgsTable id={id}/>
        <div className={classes.space} />
        <SameFunctionItemsTable funcName={item['分類']} />
        <div className={classes.space} />
        <MatchedAllOfferedItemsTable id={id} />
      </div>
    </DocumentTitle>
  );
}

Item.propTypes = {
  id: PropTypes.string,
  match: PropTypes.object,
};
