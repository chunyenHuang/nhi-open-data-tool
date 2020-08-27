import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import VisitButton from 'components/VisitButton';
import Statistics from 'components/Statistics';

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

export default function PCItemsTriageCategoryItem({ category = {} }) {
  const classes = useStyles();

  const subcategories = category['子分類'];

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Box textAlign="center">
            <Typography gutterBottom variant="h5" component="h1">
              {category['名稱']}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <div className={classes.flex} />
          <VisitButton
            // className={classes.categoryButton}
            title={'查看此類別所有醫材'}
            size="small"
            url={`/pcItems?類別[]=${category['名稱']}`}
          />
          <div className={classes.flex} />
        </CardActions>
        <CardContent>
          <Statistics data={category['統計資料']} />
        </CardContent>
      </Card>
      <Box textAlign="center" p={2}>
        <Typography gutterBottom variant="h5" component="h1" color="textSecondary">
          以下為子分類，共有 {subcategories.length} 項
        </Typography>
      </Box>
      {subcategories.map((item, index)=>(
        <Card className={classes.card} key={index}>
          <CardContent>
            <Box textAlign="center">
              <Typography gutterBottom variant="h5" component="h1">
                {item['自付差額品項功能分類']}
              </Typography>
            </Box>
          </CardContent>
          <CardContent>
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
              url={`/pcItems?類別[]=${category['名稱']}&分類[]=${item['自付差額品項功能分類']}`}
            />
          </CardActions>
          <CardContent>
            <Statistics
              data={item['統計資料']}
              compareData={category['統計資料']}
            />
          </CardContent>
        </Card>
      ))}
    </div>);
}

PCItemsTriageCategoryItem.propTypes = {
  category: PropTypes.object.isRequired,
};
