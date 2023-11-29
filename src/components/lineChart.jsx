import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const LineChart = ({ legendText, className, hourlyData, backgroundColor, borderColor }) => {

    const labels = hourlyData.map(data => data.time);
    const temperatures = hourlyData.map(data => data.data);

    const data = {
        labels: labels,
        datasets: [
            {
                label: `${legendText}`,
                data: temperatures,
                fill: true,
                backgroundColor: backgroundColor,
                borderColor: borderColor
            },
        ],
    };

    const options = {
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                },
                beginAtZero: false,
            },
        },
        elements: {
            line: {
                tension: 0.4, // Smoothes the line
            },
        },
    };

    return (
        <Line className={className} data={data} options={options} />
    );
};

export default LineChart;
