import React from 'react';
import PropTypes from 'prop-types';

const ArrowTop = ({ color }) => {
  return (
    <svg
      width="0.5vw"
      height="0.5vw"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 5L5 1L1 5" stroke={color} strokeWidth="2" />
    </svg>
  );
};

ArrowTop.propTypes = {
  color: PropTypes.string.isRequired
};

export default ArrowTop;
