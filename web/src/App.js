import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import DocumentTitle from 'react-document-title';

import Header from 'components/Header';
import routes from './routes';
import retrieve from 'utils/retrieve';
import cache from 'utils/cache';

const useStyles = makeStyles((theme) => ({
  main: {
    display: 'flex',
    padding: theme.spacing(4),
  },
  spinner: {
    position: 'absolute',
    top: 150,
    left: 'calc(50% - 20px)',
  },
  container: {
    paddingTop: 48,
    flexGrow: 1,
  },
}));

function App(props) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { lastUpdatedAt } = await retrieve('report', { bypassCache: true });
      const cacheLastUpdatedAt = await cache.get('lastUpdatedAt');
      if (lastUpdatedAt !== cacheLastUpdatedAt) {
        await cache.purge();
      }
      await cache.set('lastUpdatedAt', lastUpdatedAt);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    })();
  }, []);

  if (isLoading) {
    return (<CircularProgress className={classes.spinner} />);
  }

  return (
    <Container className={classes.main} maxWidth="xl">
      <Router basename={'/'}>
        <React.Suspense fallback={<CircularProgress className={classes.spinner} />}>
          <CssBaseline />
          <Header />
          <main className={classes.container}>
            <Switch>
              {routes.map((route) => (
                <Route
                  path={route.path}
                  exact={route.exact}
                  key={route.path}
                  render={(props) => (
                    <DocumentTitle title={`${route.documentTitle}`}>
                      <route.component {...props} />
                    </DocumentTitle>)
                  }
                />
              ))}
              <Redirect to="/" />
            </Switch>
          </main>
        </React.Suspense>
      </Router>
    </Container>
  );
}

export default App;
