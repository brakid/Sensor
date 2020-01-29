import React from 'react';
import PropTypes from 'prop-types';
import { Link, useRouteMatch } from 'react-router-dom';

const ActiveLink = ({ to, className, activeClass, children }) => {
  const isMatch = useRouteMatch({ path: to, exact: true }) !== null;
  console.log('Match: ' + JSON.stringify(isMatch));
  
  return (
    <Link className={ isMatch ? [activeClass, className].join(' ') : className } to={ to }>{ children }</Link>
  );
};

ActiveLink.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  activeClass: PropTypes.string
};

export default ActiveLink;