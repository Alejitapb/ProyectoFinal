import React from 'react';

const Container = ({
                       children,
                       className = '',
                       maxWidth = 'max-w-7xl',
                       padding = 'px-4 py-8'
                   }) => {
    return (
        <div className={`container mx-auto ${maxWidth} ${padding} ${className}`}>
            {children}
        </div>
    );
};

export default Container;