const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const loader = document.getElementById("loader");
const weatherBox = document.getElementById("weather");

const locationEl = document.getElementById("location");
const icon = document.getElementById("weather-icon");
const weatherCondition = document.getElementById("condition");
const temp = document.getElementById("temperature");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");

const API_KEY = "4JN59JTASHUTPSE2W2GFKR37Q";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();   // <<< FIXED
    if (!city) return;

    showLoader(true);
    weatherBox.classList.add("hidden");

    try {
        const data = await fetchWeather(city);
        displayWeather(data);
    } catch (err) {
        alert("City not found or API error. Please check spelling or try another.");
        console.error(err);
    }

    showLoader(false);
});

async function fetchWeather(city) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${API_KEY}&contentType=json`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    return await response.json();
}

function displayWeather(data) {
    const today = data.currentConditions;

    locationEl.textContent = data.address;
    weatherCondition.textContent = today.conditions;
    temp.textContent = `${today.temp}°C`;
    wind.textContent = `WindSpeed: ${today.windspeed} km/h`;
    humidity.textContent = `Humidity: ${today.humidity}%`;


    // Set icon image (Visual Crossing format)
    const iconName = today.icon;
    icon.src = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/1st%20Set%20-%20Color/${iconName}.png`;  // <<< FIXED
    icon.alt = today.conditions;

    weatherBox.classList.remove("hidden");
}

function showLoader(show) {
    loader.classList.toggle("hidden", !show);
}
