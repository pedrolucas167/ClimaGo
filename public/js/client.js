let autoUpdateInterval = null;
let currentCity = null;
let currentWeatherData = null;
const UPDATE_INTERVAL = 5 * 60 * 1000;

function loadRecentSearches() {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
}

function saveRecentSearch(city) {
    const searches = loadRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== city.toLowerCase());
    filtered.unshift(city);
    const limited = filtered.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(limited));
    renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.getElementById('recentSearchesList');
    const searches = loadRecentSearches();
    
    if (searches.length === 0) {
        container.innerHTML = '<p class="no-searches">Nenhuma busca recente</p>';
        return;
    }
    
    container.innerHTML = searches.map(city => 
        `<button class="recent-search-btn" onclick="searchCity('${city}')">${city}</button>`
    ).join('');
}

function searchCity(city) {
    document.getElementById('city').value = city;
    getWeather();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
}

function toggleAutoUpdate() {
    const checkbox = document.getElementById('autoUpdate');
    
    if (checkbox.checked && currentCity) {
        startAutoUpdate();
    } else {
        stopAutoUpdate();
    }
}

function startAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
    autoUpdateInterval = setInterval(() => {
        if (currentCity) {
            getWeather(true);
        }
    }, UPDATE_INTERVAL);
}

function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

function getLocation() {
    if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador');
        return;
    }
    
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByCoords(latitude, longitude);
        },
        (error) => {
            console.error('Erro de geolocalização:', error);
            alert('Erro ao obter localização. Por favor, verifique as permissões do navegador.');
            loadingElement.style.display = 'none';
        }
    );
}

async function getWeatherByCoords(lat, lon) {
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');
    
    try {
        const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao buscar dados meteorológicos.';
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        currentCity = data.name;
        currentWeatherData = data;
        document.getElementById('city').value = data.name;
        displayWeather(data);
        saveRecentSearch(data.name);
        
        await getForecast(data.name);
        
    } catch (error) {
        console.error('Erro ao obter clima:', error);
        weatherElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao buscar dados. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

async function getForecast(city) {
    const forecastElement = document.getElementById('forecast');
    
    try {
        const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar previsão');
        }
        
        const data = await response.json();
        displayForecast(data);
        
    } catch (error) {
        console.error('Erro ao obter previsão:', error);
    }
}

function displayForecast(data) {
    const forecastElement = document.getElementById('forecast');
    
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    const htmlContent = `
        <div class="forecast-container">
            <h3>Previsão para os próximos 5 dias</h3>
            <div class="forecast-grid">
                ${dailyForecasts.map(day => `
                    <div class="forecast-item">
                        <p class="forecast-date">${new Date(day.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</p>
                        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" 
                             alt="${day.weather[0].description}" 
                             class="forecast-icon">
                        <p class="forecast-temp">${Math.round(day.main.temp)}°C</p>
                        <p class="forecast-desc">${day.weather[0].description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    forecastElement.innerHTML = htmlContent;
    forecastElement.style.display = 'block';
}

async function getWeather(isAutoUpdate = false) {
    const cityInput = document.getElementById('city');
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');
    const city = cityInput.value.trim();

    if (!city) {
        alert('Por favor, digite o nome de uma cidade.');
        return;
    }

    loadingElement.style.display = 'block';
    
    if (!isAutoUpdate) {
        weatherElement.innerHTML = '';
        forecastElement.style.display = 'none';
    }

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao buscar dados meteorológicos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        currentCity = city;
        currentWeatherData = data;
        displayWeather(data);
        
        if (!isAutoUpdate) {
            saveRecentSearch(city);
            await getForecast(city);
            
            const checkbox = document.getElementById('autoUpdate');
            if (checkbox.checked) {
                startAutoUpdate();
            }
        }
        
    } catch (error) {
        console.error('Erro ao obter clima:', error);
        weatherElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao buscar dados. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

function displayWeather(data) {
    const weatherElement = document.getElementById('weather');
    const { name, sys, main, weather, wind, cached } = data;
    const updateTime = new Date().toLocaleTimeString('pt-BR');

    const htmlContent = `
        <div class="weather-main">
            <h2>${name}, ${sys.country}</h2>
            <div class="temperature-container">
                <span class="temperature">${Math.round(main.temp)}°C</span>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png"
                     alt="${weather[0].description}"
                     class="weather-icon">
            </div>
            <p class="weather-description">${weather[0].description}</p>
            ${cached ? '<span class="cached-badge">Dados em cache</span>' : ''}
        </div>
        <div class="weather-details">
            <p><strong>Sensação Térmica:</strong> ${Math.round(main.feels_like)}°C</p>
            <p><strong>Umidade:</strong> ${main.humidity}%</p>
            <p><strong>Pressão:</strong> ${main.pressure} hPa</p>
            <p><strong>Vento:</strong> ${wind.speed} m/s</p>
        </div>
        <div class="update-info">
            <p>Última atualização: ${updateTime}</p>
        </div>
        <button onclick="getAIAdvice()" class="ai-btn">🤖 Obter Recomendações da IA</button>
        <div id="ai-advice" style="display: none;"></div>
    `;

    weatherElement.innerHTML = htmlContent;
}

async function getAIAdvice() {
    if (!currentWeatherData || !currentCity) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }

    const aiElement = document.getElementById('ai-advice');
    const loadingElement = document.getElementById('loading');
    
    aiElement.style.display = 'block';
    aiElement.innerHTML = '<p class="loading">Gerando recomendações com IA...</p>';
    loadingElement.style.display = 'block';

    try {
        const response = await fetch('/api/ai/weather-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: currentWeatherData,
                city: currentCity
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao obter recomendações.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        
        aiElement.innerHTML = `
            <div class="ai-advice-container">
                <h3>🤖 Recomendações da IA</h3>
                <div class="ai-advice-content">${data.advice.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao obter recomendações:', error);
        aiElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro inesperado ao obter recomendações. Por favor, tente novamente mais tarde.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecentSearches();
});
