import React from 'react';
import PropTypes from 'prop-types';
import Link from '@material-ui/core/Link';
import { Link as RouteLink } from 'react-router-dom';

function TextLink({ url, title = 'link', variant = 'body1', ...args }) {
  if (url.startsWith('/')) {
    return (
      <Link
        variant={variant}
        color="primary"
        { ...args }
        to={url}
        component={RouteLink}
      >
        {title}
      </Link>);
  }
  return (
    <Link
      variant={variant}
      color="primary"
      { ...args }
      target="_blank"
      href={url}
    >
      {title}
    </Link>);
}

TextLink.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  variant: PropTypes.string,
};

export default TextLink;
