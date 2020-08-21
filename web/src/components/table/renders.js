import React from 'react';

import TextLink from 'components/TextLink';
import { getCertificateLinkUrl } from 'utils/retrieve';

export const certificateLinkRender = (value) => {
  const code = value.match(/\d+/)[0];
  return <TextLink url={getCertificateLinkUrl(code)} title={code} />;
};
