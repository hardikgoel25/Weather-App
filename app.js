const form = document.querySelector('#geo');
const currTemp = document.querySelector('#currTemp');
const place = document.querySelector('#location');
const timeElements = document.querySelectorAll('.time');
const hourTempElements = document.querySelectorAll('.hourTemp');
const timer = document.querySelector('#timer');
const condition = document.querySelector('#condition');
const High = document.querySelector('#HiLo').firstElementChild;
const Low = document.querySelector('#HiLo').lastElementChild;
const dayElements = document.querySelectorAll('#day');
const highTemps = document.querySelectorAll('#h1');
const lowTemps = document.querySelectorAll('#l1');
const pm = document.querySelector('.PM');
const uv = document.querySelector('.UV');
import CONFIG from './config.js';
const apiKey = CONFIG.OPENWEATHER_API_KEY;

let userLat, userLong;

let weatherIcons = {
    0: 'wi-day-sunny', 
    1: 'wi-day-sunny-overcast', 
    2: 'wi-day-cloudy', 
    3: 'wi-cloudy',
    45: 'wi-fog', 48: 'wi-fog',
    51: 'wi-day-showers', 53: 'wi-day-showers', 55: 'wi-day-showers',
    56: 'wi-sleet', 57: 'wi-sleet',
    61: 'wi-rain', 63: 'wi-rain', 65: 'wi-rain',
    66: 'wi-rain-mix', 67: 'wi-rain-mix',
    71: 'wi-snow', 73: 'wi-snow', 75: 'wi-snow',
    77: 'wi-snowflake-cold',
    80: 'wi-showers', 81: 'wi-showers', 82: 'wi-showers',
    95: 'wi-thunderstorm', 96: 'wi-thunderstorm', 97: 'wi-thunderstorm'
};
let weatherCodes = {
    0: 'Clear sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 
    51: 'Drizzle-light', 53: 'Drizzle-moderate', 55: 'Drizzle-heavy', 56: 'Drizzle', 57: 'Drizzle',
    61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 66: 'Moderate Rain', 67: 'Heavy Rain', 
    71: 'Light Snowfall', 73: 'Moderate Snowfall', 75: 'Heavy Snowfall', 77: 'Snow Grains', 
    80: 'Rain showers', 81: 'Rain showers', 82: 'Rain showers', 95: 'ThunderStorm', 96: 'ThunderStorm', 97: 'ThunderStorm'
};

function resetHourlyForecast() {
    for (let i = 0; i < timeElements.length; i++) {
        timeElements[i].innerText = '-';
        hourTempElements[i].innerHTML = '-';
    }
}

function updateHourlyForecast(hourlyData, start) {
    for (let i = 0; i < timeElements.length; i++) {
        timeElements[i].innerText = hourlyData.time[start + i].slice(-5);
        hourTempElements[i].innerHTML = `${hourlyData.temperature_2m[start + i]}&deg;`;
    }
}

function updateDailyForecast(dailyData) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayElements[0].innerHTML = 'Today'
    lowTemps[0].innerHTML = `${dailyData.temperature_2m_min[0].toFixed(1)}&deg;`;
    highTemps[0].innerHTML = `${dailyData.temperature_2m_max[0].toFixed(1)}&deg;`;
    for (let i = 1; i < dayElements.length; i++) {
        const date = new Date(dailyData.time[i]);
        dayElements[i].innerHTML = days[date.getDay()];
        lowTemps[i].innerHTML = `${dailyData.temperature_2m_min[i].toFixed(1)}&deg;`;
        highTemps[i].innerHTML = `${dailyData.temperature_2m_max[i].toFixed(1)}&deg;`;
    }
}

function updateCurrentWeather(current, daily) {
    currTemp.innerHTML = `${current.temperature_2m}&deg;`;
    High.innerHTML = `High: ${daily.temperature_2m_max[0]}&deg;`;
    Low.innerHTML = `Low: ${daily.temperature_2m_min[0]}&deg;`;
    timer.innerText = current.time.replace('T', '\n');
    condition.querySelector('#conditionText').innerText = weatherCodes[current.weather_code] || 'Unknown';
    const weatherIconElement = document.querySelector('#weatherIcon');
    if (weatherIconElement) {
        const iconClass = weatherIcons[current.weather_code] || 'wi-na';
        
        // Reset and add the appropriate icon class
        weatherIconElement.className = 'wi'; // Reset to base class
        weatherIconElement.classList.add(iconClass);
    } else {
        console.error('Weather icon element not found!');
    }
}

async function updateAirQuality(lat, long) {
    try {
        const AQI = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${long}&current=pm2_5,uv_index`);
        const AQIres = AQI.data.current;
        pm.innerHTML = AQIres.pm2_5;
        uv.innerHTML = AQIres.uv_index;
    } catch (error) {
        console.error('Error fetching air quality data', error);
    }
}

// Function to get user location
function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLat = position.coords.latitude;
            userLong = position.coords.longitude;
            console.log('User Latitude:', userLat);
            console.log('User Longitude:', userLong);
            callback();  
        }, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
        // Default coordinates (Delhi)
        userLat = 28.6519;
        userLong = 77.2315;
        callback();
    }
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

getLocation(async function() {
    try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${userLat}&longitude=${userLong}&current=temperature_2m,weather_code&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        
        const current = res.data.current;
        const daily = res.data.daily;
        const hourly = res.data.hourly;
        
        place.innerHTML = "Current Location";

        updateCurrentWeather(current, daily);

        let currTime = `${current.time.slice(0, -2)}00`;
        let start = hourly.time.indexOf(currTime);
        resetHourlyForecast();
        updateHourlyForecast(hourly, start);

        updateDailyForecast(daily);

        updateAirQuality(userLat, userLong);
    } catch (error) {
        console.error('Error fetching weather data', error);
    } finally {
        form.querySelector('input').value = ''; 
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    let city = form.querySelector('input').value;
    
        
        try {
            const loc = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`);
            const { lat, lon, name } = loc.data[0];
            place.innerHTML = name;

            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            
            const current = res.data.current;
            const daily = res.data.daily;
            const hourly = res.data.hourly;
            
            updateCurrentWeather(current, daily);

            let currTime = `${current.time.slice(0, -2)}00`;
            let start = hourly.time.indexOf(currTime);
            resetHourlyForecast();
            updateHourlyForecast(hourly, start);

            updateDailyForecast(daily);

            updateAirQuality(lat, lon);
            
        } catch (error) {
            console.error('Error fetching weather data', error);
        } finally {
            form.querySelector('input').value = '';
        }
    }
);
