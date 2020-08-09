import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { Link } from 'react-router-dom';

function VisitButton({ url = '', title = 'Visit', tooltip, icon, className, variant = 'outlined', target = '_self' }) {
  if (typeof url !== 'string') return null;

  const isDisabled = (!url || url === '' || (!url.startsWith('http') && !url.startsWith('/')));
  const size = 'small';

  const tooltipTitle = tooltip || (isDisabled ? '' : title);

  if (icon) {
    return (
      <Tooltip title={tooltipTitle}>
        <span>
          <IconButton
            className={className}
            disabled={isDisabled}
            aria-label={title}
            // component="span"
            target="_self"
            href={url}
            size={size}
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>);
  }
  if (url.startsWith('/')) {
    return (
      <Button
        className={className}
        variant={variant}
        color="primary"
        size={size}
        to={url}
        disabled={isDisabled}
        component={Link}
        target={target}
      >
        {title}
      </Button>);
  }
  return (
    <Button
      className={className}
      variant={variant}
      color="primary"
      size={size}
      target="_self"
      href={url}
      disabled={isDisabled}
    >
      {title}
    </Button>);
}

VisitButton.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  tooltip: PropTypes.string,
  icon: PropTypes.object,
  className: PropTypes.string,
  variant: PropTypes.string,
  target: PropTypes.string,
};

export default VisitButton;
