import React from 'react';

const Loading = ({
                     size = 'medium',
                     message = 'Cargando...',
                     fullScreen = false
                 }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const LoadingSpinner = () => (
        <div className="relative">
            {/* Outer ring */}
            <div className={`${sizeClasses[size]} border-4 border-secondary-yellow rounded-full animate-spin`}>
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-orange rounded-full animate-spin"></div>
            </div>
            {/* Inner pulse */}
            <div className={`absolute inset-2 bg-primary-yellow rounded-full animate-pulse opacity-50`}></div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
                <div className="text-center">
                    <LoadingSpinner />
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-primary-red mb-2">Cali Pollo</h3>
                        <p className="text-gray-600">{message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            {message && (
                <p className="mt-4 text-gray-600 text-center">{message}</p>
            )}
        </div>
    );
};

export default Loading;