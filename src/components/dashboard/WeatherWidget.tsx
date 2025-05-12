"use client";

import { useState, useEffect } from 'react';

interface WeatherWidgetProps {
    location: string;
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate weather data
        const fetchWeather = async () => {
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Randomly generate weather data for demo
                const temp = Math.floor(Math.random() * 15) + 20; // 20-35°C
                const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
                const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'];
                const condition = conditions[Math.floor(Math.random() * conditions.length)];

                setWeather({
                    temperature: temp,
                    humidity: humidity,
                    condition: condition,
                    forecast: [
                        { day: 'Today', temp: temp, condition: condition },
                        { day: 'Tomorrow', temp: temp + Math.floor(Math.random() * 5) - 2, condition: conditions[Math.floor(Math.random() * conditions.length)] },
                        { day: 'Wed', temp: temp + Math.floor(Math.random() * 5) - 2, condition: conditions[Math.floor(Math.random() * conditions.length)] },
                    ]
                });
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, [location]);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'sunny': return '☀️';
            case 'partly cloudy': return '⛅';
            case 'cloudy': return '☁️';
            case 'light rain': return '🌦️';
            case 'heavy rain': return '🌧️';
            default: return '☀️';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 h-full flex justify-center items-center">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-24 bg-gray-200 rounded mb-2 mx-auto"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Local Weather</h3>
            <p className="text-sm text-gray-600 mb-4">{location}</p>

            <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">{getWeatherIcon(weather.condition)}</span>
                <div>
                    <div className="text-black text-3xl font-bold">{weather.temperature}°C</div>
                    <div className="text-gray-600">{weather.condition}</div>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">Humidity: {weather.humidity}%</div>

            <div className="text-black mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">3-Day Forecast</h4>
                <div className="flex justify-between">
                    {weather.forecast.map((day: any, index: number) => (
                        <div key={index} className="text-center">
                            <div className="text-xs font-medium">{day.day}</div>
                            <div className="text-lg my-1">{getWeatherIcon(day.condition)}</div>
                            <div className="text-sm">{day.temp}°C</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}