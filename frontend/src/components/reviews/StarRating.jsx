import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
                        rating = 0,
                        maxRating = 5,
                        size = 'md',
                        interactive = false,
                        onChange = null,
                        showNumber = false,
                        precision = 1
                    }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(rating);

    const getSizeClasses = () => {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6',
            xl: 'w-8 h-8'
        };
        return sizes[size] || sizes.md;
    };

    const handleMouseEnter = (starIndex) => {
        if (interactive) {
            setHoveredRating(starIndex);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoveredRating(0);
        }
    };

    const handleClick = (starIndex) => {
        if (interactive) {
            const newRating = starIndex;
            setSelectedRating(newRating);
            if (onChange) {
                onChange(newRating);
            }
        }
    };

    const renderStar = (index) => {
        const starNumber = index + 1;
        const currentRating = interactive ? (hoveredRating || selectedRating) : rating;

        // Determinar el estado de la estrella
        let fillPercentage = 0;
        if (currentRating >= starNumber) {
            fillPercentage = 100;
        } else if (currentRating > starNumber - 1) {
            fillPercentage = (currentRating - (starNumber - 1)) * 100;
        }

        const isActive = fillPercentage > 0;
        const isPartial = fillPercentage > 0 && fillPercentage < 100;

        return (
            <div
                key={index}
                className="relative inline-block"
                onMouseEnter={() => handleMouseEnter(starNumber)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(starNumber)}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
                {/* Estrella de fondo (vacía) */}
                <Star
                    className={`${getSizeClasses()} text-gray-300 ${
                        interactive ? 'hover:text-yellow-400 transition-colors' : ''
                    }`}
                />

                {/* Estrella de primer plano (llena) */}
                {fillPercentage > 0 && (
                    <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{ width: `${fillPercentage}%` }}
                    >
                        <Star
                            className={`${getSizeClasses()} text-yellow-400 fill-current`}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="flex items-center">
                {[...Array(maxRating)].map((_, index) => renderStar(index))}
            </div>

            {showNumber && (
                <span className={`font-medium text-gray-600 ml-2 ${
                    size === 'sm' ? 'text-sm' :
                        size === 'lg' ? 'text-lg' :
                            size === 'xl' ? 'text-xl' : 'text-base'
                }`}>
          {interactive ? (hoveredRating || selectedRating) : rating.toFixed(precision)}
                    {!interactive && maxRating !== 5 && (
                        <span className="text-gray-400">/{maxRating}</span>
                    )}
        </span>
            )}
        </div>
    );
};

export default StarRating;