import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import VisitButton from 'components/VisitButton';
import retrieve from 'utils/retrieve';

const useStyles = makeStyles((theme) => ({
  categoryButton: {
    margin: theme.spacing(2),
  },
}));

export default function PCItemsTriage() {
  const classes = useStyles();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      setCategories(await retrieve('自付差額品項類別'));
    })();
  }, []);

  return (
    <Container>
      <Typography variant="h5" component="h1">
        請問有哪些醫療特材類別，我可以自付差額來選用健保給付以外的品項？
      </Typography>
      {categories.map((item)=>(
        <VisitButton
          className={classes.categoryButton}
          key={item}
          title={item}
          url={`/pcItems?類別[]=${item}`}
        />
      ))}

      {/* <Typography variant="h5" component="h6">
        小明想使用不同於健保給付的品項(ex: 維州-豪雅預載式單片型人工水晶體)，想選用 "博士倫"優視非球面人工水晶體:非球面軟式人工水晶體
      </Typography> */}

    </Container>);
}
