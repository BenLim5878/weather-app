import React, { createContext, useState } from 'react';

export const TemperatureMetricContext = createContext();

export function TemperatureMetricProvider({ children }) {
    const [temperatureMetric, setTemperatureMetric] = useState("celsius");

    const updateTemperatureMetric = (newState) => {
        setTemperatureMetric(newState);
    };

    return (
        <TemperatureMetricContext.Provider value={{ temperatureMetric, updateTemperatureMetric }}>
            {children}
        </TemperatureMetricContext.Provider>
    );
}

