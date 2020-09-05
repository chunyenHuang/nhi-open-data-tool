import React from 'react';

import Container from '@material-ui/core/Container';

import PCItemsTriage from 'components/PCItemsTriage';
// import Disclaimer from 'components/Disclaimer';

export default function Home() {
  return (
    <Container maxWidth="xl">
      <PCItemsTriage />
      {/* <Disclaimer /> */}
    </Container>);
}
