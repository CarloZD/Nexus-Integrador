import React from 'react';

const Modal = ({ isOpen, onClose, children, transparentBg = false }) => {
    if (!isOpen) return null;

    const modalStyles = transparentBg
        ? 'relative'
        : 'bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={modalStyles}>
                <button onClick={onClose} className={`absolute top-0 right-0 mt-2 mr-2 ${transparentBg ? 'text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;