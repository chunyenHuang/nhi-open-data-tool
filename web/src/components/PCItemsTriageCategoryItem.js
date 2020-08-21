import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import VisitButton from 'components/VisitButton';

const useStyles = makeStyles((theme) => ({
  categoryButton: {
    margin: theme.spacing(2),
  },
  card: {
    padding: theme.spacing(1),
    // marginLeft: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  flex: {
    flex: 1,
  },
}));

export default function PCItemsTriageCategoryItem({ categoryName, subcategories = [] }) {
  const classes = useStyles();

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="h6" component="h1">
            {categoryName}
          </Typography>
          {/* TODO: 佔率資訊 分布資訊 價位資訊 */}
        </CardContent>
        <CardActions>
          <Button size="small" color="default">
            共有{subcategories.length}個子分類
          </Button>
          <div className={classes.flex} />
          <VisitButton
            // className={classes.categoryButton}
            title={'查看此類別所有醫材'}
            size="small"
            url={`/pcItems?類別[]=${categoryName}`}
          />
        </CardActions>
      </Card>
      {subcategories.map((item, index)=>(
        <Card className={classes.card} key={index}>
          <CardContent>
            <Typography gutterBottom variant="subtitle1" component="p">
              {item['自付差額品項功能分類']}
            </Typography>
            {item['自付差額品項功能分類說明'].split('\n').map((subtext, i) => (
              <Typography key={i} variant="body2" color="textSecondary" component="p">
                {subtext}
              </Typography>
            ))}
          </CardContent>
          <CardActions>
            {['一', '二', '三', '四', '五'].filter((num) => item[`功能${num}`] && item[`功能${num}`] !== '無').map((num)=>(
              <Button key={num} size="small" color="secondary">
                {item[`功能${num}`]}
              </Button>
            ))}
            <div className={classes.flex} />
            <VisitButton
              // className={classes.categoryButton}
              title={'查看此子類別相關醫材'}
              size="small"
              url={`/pcItems?類別[]=${categoryName}&分類[]=${item['自付差額品項功能分類']}`}
            />
          </CardActions>
        </Card>
      ))}
    </div>);
}

PCItemsTriageCategoryItem.propTypes = {
  categoryName: PropTypes.string.isRequired,
  subcategories: PropTypes.array.isRequired,
};
