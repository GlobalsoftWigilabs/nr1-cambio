import React from 'react';
import PropTypes from 'prop-types';

const Bar = props => {
  const { bgcolorMain, bgColor, quantityPercentage, title, quantity } = props;
  const containerStylesBar = {
    width: '99%',
    height: '1.3vw',
    minHeight: '17px',
    backgroundColor: bgColor,
    borderRadius: 0
  };

  const fillerStyles = {
    height: '100%',
    transition: 'width 1s ease-in-out',
    width: quantityPercentage > 0 && `${quantityPercentage}%`,
    backgroundColor: quantity === 0 ? bgColor : bgcolorMain,
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    content: ' '
  };
  return (
    <div className="barContainer">
      <div className="barContainer__quantity">
        <div className="barContainer--quantity fontMedium">{quantity}</div>
      </div>
      <div className="barContainer__content">
        <div className="fontSmall">{title}</div>
        <div className="barContainer__bar">
          <div style={containerStylesBar}>
            <div style={fillerStyles} />
          </div>
        </div>
      </div>
    </div>
  );
};
Bar.propTypes = {
  bgColor: PropTypes.string.isRequired,
  bgcolorMain: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  quantityPercentage: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired
};
export default Bar;
