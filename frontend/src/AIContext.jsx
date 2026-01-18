import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const [activeTask, setActiveTask] = useState(null);

    // task: { message: string, model: string }
    const startTask = (message, model = "Local AI") => {
        setActiveTask({ message, model });
    };

    const endTask = () => {
        setActiveTask(null);
    };

    return (
        <AIContext.Provider value={{ activeTask, startTask, endTask }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => useContext(AIContext);
