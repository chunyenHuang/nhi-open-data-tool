import React from 'react';

import TextLink from 'components/TextLink';
import { getCertificateLinkUrl } from 'utils/retrieve';

export const certificateLinkRender = (value, variant) => {
  return <TextLink
    url={getCertificateLinkUrl(value)}
    title={value}
    variant={variant}
  />;
};
