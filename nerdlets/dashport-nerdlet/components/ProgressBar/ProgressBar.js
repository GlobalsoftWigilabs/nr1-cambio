import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = props => {
  const { bgcolor, completed } = props;

  const containerStyles = {
    width: '99%',
    backgroundColor: '#e0e0de',
    borderRadius: 3
  };

  const fillerStyles = {
    height: '12px',
    transition: 'width 1s ease-in-out',
    width: completed>0&&completed<=3?`${5}%`:`${completed}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  };

  const labelStyles = {
    padding: 5,
    paddingRight: 0.5,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px'
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        {completed !== 0 && <span style={labelStyles}>{`${completed}%`}</span>}
      </div>
    </div>
  );
};
ProgressBar.propTypes = {
  bgcolor: PropTypes.string.isRequired,
  completed: PropTypes.number.isRequired
};
export default ProgressBar;
