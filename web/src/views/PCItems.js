import React from 'react';
import PropTypes from 'prop-types';
import querystring from 'query-string';

import PCItemsTable from 'components/PCItemsTable';

export default function PCItems({ location }) {
  return (
    <div>
      <PCItemsTable prefilters={querystring.parse(location.search, { arrayFormat: 'bracket' })}/>
    </div>);
}

PCItems.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};
