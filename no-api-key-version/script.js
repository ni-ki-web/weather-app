const weatherInfo = document.getElementById("weather-info");
const form = document.getElementById("location-form");
const locationInput = document.getElementById("location-input");
const toggleUnitBtn = document.getElementById("toggle-unit");
const loader = document.getElementById("loader");

let currentWeather = null;
let currentUnit = "celsius";

async function getCoordinates(location) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${location}&format=json&limit=1`);
  const data = await response.json();
  if (data.length === 0) {
    throw new Error("Location not found");
  }

  const lat = data[0].lat;
  const lon = data[0].lon;

  // Use display_name and pick first two parts (city, country)
  const parts = data[0].display_name.split(",");
  const cityCountry = `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;

  return {
    lat,
    lon,
    name: cityCountry
  };
}

// --- Get weather data from Open-Meteo ---
async function getWeather(location) {
  const coords = await getCoordinates(location);
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
  const data = await response.json();
  return {
    location: coords.name,
    temp: data.current_weather.temperature,
    conditionCode: data.current_weather.weathercode,
    wind: data.current_weather.windspeed
  };
}

// --- Weather Mapping ---
const WEATHER_MAP = {
  // Clear
  0:  { text: "Clear Sky",          icon: "wi-day-sunny" },

  // Cloudy
  1:  { text: "Mainly Clear",       icon: "wi-day-sunny-overcast" },
  2:  { text: "Partly Cloudy",      icon: "wi-day-cloudy" },
  3:  { text: "Overcast",           icon: "wi-cloudy" },

  // Fog
  45: { text: "Fog",                icon: "wi-fog" },
  48: { text: "Rime Fog",           icon: "wi-fog" },

  // Drizzle
  51: { text: "Light Drizzle",      icon: "wi-sprinkle" },
  53: { text: "Moderate Drizzle",   icon: "wi-sprinkle" },
  55: { text: "Dense Drizzle",      icon: "wi-sprinkle" },
  56: { text: "Freezing Drizzle",   icon: "wi-rain-mix" },
  57: { text: "Freezing Drizzle",   icon: "wi-rain-mix" },

  // Rain
  61: { text: "Slight Rain",        icon: "wi-rain" },
  63: { text: "Moderate Rain",      icon: "wi-rain" },
  65: { text: "Heavy Rain",         icon: "wi-rain" },
  66: { text: "Freezing Rain",      icon: "wi-rain-mix" },
  67: { text: "Freezing Rain",      icon: "wi-rain-mix" },

  // Snow
  71: { text: "Light Snow",         icon: "wi-snow" },
  73: { text: "Moderate Snow",      icon: "wi-snow" },
  75: { text: "Heavy Snow",         icon: "wi-snow" },
  77: { text: "Snow Grains",        icon: "wi-snowflake-cold" },

  // Showers
  80: { text: "Light Rain Showers", icon: "wi-showers" },
  81: { text: "Moderate Showers",   icon: "wi-showers" },
  82: { text: "Violent Showers",    icon: "wi-showers" },
  85: { text: "Snow Showers",       icon: "wi-snow-wind" },
  86: { text: "Heavy Snow Showers", icon: "wi-snow-wind" },

  // Thunderstorms
  95: { text: "Thunderstorm",        icon: "wi-thunderstorm" },
  96: { text: "Thunderstorm & Hail", icon: "wi-storm-showers" },
  99: { text: "Thunderstorm & Hail", icon: "wi-storm-showers" }
};

// --- Weather icons mapping ---
function getWeatherIcon(code) {
  return WEATHER_MAP[code] || { text: "Unknown", icon: "wi-na" };
}

function getBackgroundClass(code) {
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([71, 73, 75, 85, 86].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "thunder";
  if ([45, 48].includes(code)) return "foggy";

  return "sunny"; // default = clear skies
}

// --- Display weather ---
function displayWeather(weather) {
  currentWeather = weather;
  weatherInfo.replaceChildren();

  const { text, icon } = getWeatherIcon(weather.conditionCode);

  const card = document.createElement("div");
  card.classList.add("weather-card");

  const iconEl = document.createElement("i");
  iconEl.classList.add("wi", icon, "weather-icon");

  const locationEl = document.createElement("h2");
  locationEl.classList.add("city-name");
  locationEl.textContent = weather.location;

  const conditionEl = document.createElement("p");
  conditionEl.textContent = text;

  const tempEl = document.createElement("p");
  tempEl.classList.add('temperature');

  const tempValue = currentUnit === "fahrenheit" ? (weather.temp * 9/5) + 32 : weather.temp;

  tempEl.textContent = `${tempValue.toFixed(1)}°${currentUnit === "celsius" ? "C" : "F"}`;

  const windEl = document.createElement("p");
  windEl.textContent = `Wind Speed: ${weather.wind} km/h`;

  card.append(locationEl, iconEl, conditionEl, tempEl, windEl);
  weatherInfo.appendChild(card);

  document.body.className = "";
  document.body.classList.add(getBackgroundClass(weather.conditionCode));
}

// --- Handle form submit (with loader) ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (!location) return;

  loader.classList.remove("hidden");
  weatherInfo.replaceChildren();

  try {
    const weather = await getWeather(location);
    displayWeather(weather);
  } catch (err) {
    console.error(err);
    const errorMsg = document.createElement("p");
    errorMsg.textContent = "Error fetching weather data.";
    weatherInfo.appendChild(errorMsg);
  } finally {
    loader.classList.add("hidden"); // Always hide loader
  }
});

// --- Toggle between Celsius/Fahrenheit ---
toggleUnitBtn.addEventListener("click", () => {
  if (!currentWeather) return;
  currentUnit = currentUnit === "celsius" ? "fahrenheit" : "celsius";
  displayWeather(currentWeather);
});