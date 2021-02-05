import React from 'react';
import PropTypes from 'prop-types';

const ArrowUnion = ({ colorArrowTwo, colorArrowOne }) => {
  return (
    <svg
      width="8"
      height="15"
      viewBox="0 0 7 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 8.5L3.5 11L6 8.5" stroke={colorArrowOne} />
      <path d="M6 3.5L3.5 1L1 3.5" stroke={colorArrowTwo} />
    </svg>
  );
};

ArrowUnion.propTypes = {
  colorArrowTwo: PropTypes.string.isRequired,
  colorArrowOne: PropTypes.string.isRequired
};

export default ArrowUnion;
