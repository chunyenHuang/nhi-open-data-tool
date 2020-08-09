import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

import routes from '../routes';
import cache from 'utils/cache';
import GithubLinkButton from 'components/GithubLinkButton';

const useStyles = makeStyles((theme) => ({
  appBar: {},
  title: {
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  space: {
    flexGrow: 1,
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

function Header() {
  const classes = useStyles();
  const history = useHistory();

  const [lastUpdatedAt, setLastUpdatedAt] = useState();

  useEffect(() => {
    (async () => {
      setLastUpdatedAt(await cache.get('lastUpdatedAt'));
    })();
  }, []);

  return (
    <AppBar position="fixed" color="default" className={classes.appBar}>
      <Toolbar variant="dense">
        <Typography variant="h6" className={classes.title} onClick={() => history.push('/')}>
          查查醫療品項
        </Typography>
        {routes.filter(({ hideFromMenu })=>!hideFromMenu).map(({ title, path }) => (
          <Button to={path} key={title} component={Link}>
            {title}
          </Button>
        ))}

        <div className={classes.space}></div>

        <GithubLinkButton
          className={classes.button}
          url='chunyenHuang/nhi-open-data-tool'
        />

        {lastUpdatedAt &&
          <Typography
            variant="body2"
            color="textSecondary"
          >
            資料更新於 {moment(lastUpdatedAt).fromNow()}
          </Typography>}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {};

export default Header;
