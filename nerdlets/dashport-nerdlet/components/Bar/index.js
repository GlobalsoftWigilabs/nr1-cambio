import React from 'react';
import PropTypes from 'prop-types';

const Bar = props => {
  const { bgcolorMain, bgColor, quantityPercentage, title, quantity } = props;
  const containerStylesBar = {
    width: '99%',
    backgroundColor: bgColor,
    borderRadius: 0
  };

  const containerStylesBarTitle = {
    marginLeft: '20%',
    fontSize: '0.72vw',
    textTransform: 'capitalize'
  };

  const fillerStyles = {
    height: '1.3vw',
    transition: 'width 1s ease-in-out',
    width: quantityPercentage > 0 && `${quantityPercentage}%`,
    backgroundColor: quantity === 0 ? bgColor : bgcolorMain,
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    content: ' '
  };

  const containerStyles = {
    display: 'grid',
    gridTemplate: '50% 50% /1fr'
  };

  const distributionQuantityAndBar = {
    display: 'grid',
    gridTemplate: '1fr / 20% 80%',
    fontSize: '0.81vw'
  };
  const barQuantity = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyles}>
      <div style={containerStylesBarTitle}>{title}</div>
      <div style={distributionQuantityAndBar}>
        <div style={barQuantity}>{quantity}</div>
        <div style={containerStylesBar}>
          <div style={fillerStyles} />
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
