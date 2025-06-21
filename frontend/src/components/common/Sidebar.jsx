import React from 'react';
import { X } from 'lucide-react';

const Sidebar = ({
                     isOpen,
                     onClose,
                     title,
                     children,
                     position = 'right',
                     width = 'w-80'
                 }) => {
    const positionClasses = {
        left: 'left-0',
        right: 'right-0'
    };

    const translateClasses = {
        left: isOpen ? 'translate-x-0' : '-translate-x-full',
        right: isOpen ? 'translate-x-0' : 'translate-x-full'
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`
        fixed top-0 ${positionClasses[position]} h-full ${width} 
        bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${translateClasses[position]}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Sidebar;