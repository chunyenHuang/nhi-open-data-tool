import React from 'react';

import TextLink from 'components/TextLink';
import { getCertificateLinkUrl, getOrgUrl } from 'utils/retrieve';

export const certificateLinkRender = (value, variant) => {
  return <TextLink
    url={getCertificateLinkUrl(value)}
    title={value}
    variant={variant}
  />;
};

export const orgLinkRender = (value, id, variant) => {
  return <TextLink
    url={getOrgUrl(id)}
    title={value}
    variant={variant}
  />;
};
