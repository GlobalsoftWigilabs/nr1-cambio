import React from 'react';

const ArrowTop = ({ color }) => {
    return (
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5L5 1L1 5" stroke={color}  strokeWidth="2"/>
        </svg>
    )
};

export default ArrowTop;