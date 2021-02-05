import React from 'react';
import PropTypes from 'prop-types';

const ArrowDown = ({ color }) => {
  return (
    <svg
      width="0.5vw"
      height="0.5vw"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 1L5 5L9 1" stroke={color} strokeWidth="2" />
    </svg>
  );
};
ArrowDown.propTypes = {
  color: PropTypes.string.isRequired
};
export default ArrowDown;
