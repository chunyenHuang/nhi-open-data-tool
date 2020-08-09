import React from 'react';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({}));

export default function Disclaimer() {
  const classes = useStyles();
  return (
    <Box>
      申明~~~
    </Box>);
}

Disclaimer.propTypes = {};
