let autoUpdateInterval = null;
let locationWatchId = null;
let isTrackingLocation = false;
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
            handleGeolocationError(error);
            loadingElement.style.display = 'none';
        }
    );
}

function startLocationTracking() {
    if (!navigator.geolocation) {
        alert('Geolocalização não é suportada pelo seu navegador');
        return;
    }

    if (isTrackingLocation) {
        stopLocationTracking();
        return;
    }

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    locationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const accuracy = position.coords.accuracy;
            
            console.log(`Localização atualizada: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (precisão: ${accuracy.toFixed(0)}m)`);
            
            await getWeatherByCoords(latitude, longitude);
            updateLocationTrackingUI(true);
        },
        (error) => {
            console.error('Erro no rastreamento de localização:', error);
            handleGeolocationError(error);
            stopLocationTracking();
        },
        options
    );

    isTrackingLocation = true;
    updateLocationTrackingUI(true);
}

function stopLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
    isTrackingLocation = false;
    updateLocationTrackingUI(false);
}

function handleGeolocationError(error) {
    let message = 'Erro ao obter localização.';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada. Por favor, habilite a geolocalização nas configurações do navegador.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Informações de localização indisponíveis.';
            break;
        case error.TIMEOUT:
            message = 'Tempo esgotado ao obter localização.';
            break;
        default:
            message = 'Erro desconhecido ao obter localização.';
    }
    
    alert(message);
}

function updateLocationTrackingUI(isTracking) {
    const geoBtn = document.querySelector('.geo-btn');
    const locationStatus = document.getElementById('location-status');
    
    if (geoBtn) {
        if (isTracking) {
            geoBtn.innerHTML = '🛑';
            geoBtn.title = 'Parar rastreamento de localização';
            geoBtn.setAttribute('aria-label', 'Parar rastreamento de localização');
            geoBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            geoBtn.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        } else {
            geoBtn.innerHTML = '📍';
            geoBtn.title = 'Iniciar rastreamento de localização';
            geoBtn.setAttribute('aria-label', 'Iniciar rastreamento de localização');
            geoBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            geoBtn.style.borderColor = 'var(--border-color)';
        }
    }
    
    if (locationStatus) {
        locationStatus.style.display = isTracking ? 'flex' : 'none';
    }
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

        const forecastData = await getForecast(data.name);
        
        await Promise.all([
            getAirQuality(lat, lon),
            getUVIndex(lat, lon),
            getHourlyForecast(lat, lon)
        ]);

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
        return data;

    } catch (error) {
        console.error('Erro ao obter previsão:', error);
        return null;
    }
}

async function getAirQuality(lat, lon) {
    const airQualityElement = document.getElementById('air-quality');

    try {
        const response = await fetch(`/api/air-pollution?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar qualidade do ar');
        }

        const data = await response.json();
        displayAirQuality(data);

    } catch (error) {
        console.error('Erro ao obter qualidade do ar:', error);
    }
}

async function getUVIndex(lat, lon) {
    const uvElement = document.getElementById('uv-index');

    try {
        const response = await fetch(`/api/uv-index?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar índice UV');
        }

        const data = await response.json();
        displayUVIndex(data);

    } catch (error) {
        console.error('Erro ao obter índice UV:', error);
    }
}

async function getHourlyForecast(lat, lon) {
    const hourlyElement = document.getElementById('hourly-forecast');

    try {
        const response = await fetch(`/api/onecall?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar previsão horária');
        }

        const data = await response.json();
        displayHourlyForecast(data);

    } catch (error) {
        console.error('Erro ao obter previsão horária:', error);
    }
}

async function getExtremePhenomena(weatherData, forecastData) {
    const phenomenaElement = document.getElementById('extreme-phenomena');

    try {
        const response = await fetch('/api/ai/extreme-phenomena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: weatherData,
                forecastData: forecastData,
                city: currentCity
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao analisar fenômenos extremos');
        }

        const data = await response.json();
        displayExtremePhenomena(data);

    } catch (error) {
        console.error('Erro ao obter análise de fenômenos extremos:', error);
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
        document.getElementById('air-quality').style.display = 'none';
        document.getElementById('uv-index').style.display = 'none';
        document.getElementById('hourly-forecast').style.display = 'none';
        document.getElementById('extreme-phenomena').style.display = 'none';
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
            const forecastData = await getForecast(city);

            if (data.coord) {
                await Promise.all([
                    getAirQuality(data.coord.lat, data.coord.lon),
                    getUVIndex(data.coord.lat, data.coord.lon),
                    getHourlyForecast(data.coord.lat, data.coord.lon)
                ]);
            }

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
        <div class="weather-hero">
            <div class="weather-heading">
                <div>
                    <p class="weather-kicker">Condição atual</p>
                    <h2>${name}, ${sys.country}</h2>
                </div>
                <div class="weather-status">
                    ${cached ? '<span class="cached-badge">Dados em cache</span>' : ''}
                    <span class="weather-time">Atualizado às ${updateTime}</span>
                </div>
            </div>
            <div class="weather-snapshot">
                <div class="temperature-container">
                    <span class="temperature">${Math.round(main.temp)}°C</span>
                    <p class="weather-description">${weather[0].description}</p>
                </div>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png"
                     alt="${weather[0].description}"
                     class="weather-icon">
            </div>
        </div>
        <div class="weather-metrics">
            <div class="metric-card">
                <span class="metric-label">Sensação térmica</span>
                <span class="metric-value">${Math.round(main.feels_like)}°C</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Umidade</span>
                <span class="metric-value">${main.humidity}%</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Pressão</span>
                <span class="metric-value">${main.pressure} hPa</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Vento</span>
                <span class="metric-value">${wind.speed} m/s</span>
            </div>
        </div>
        <div class="update-info weather-footer">
            <p>Atualização local: ${updateTime}</p>
        </div>
        <div class="weather-actions">
            <button onclick="getAIAdvice()" class="ai-btn">🤖 Recomendações</button>
            <button onclick="analyzeExtremePhenomena()" class="phenomena-btn">🌍 Fenômenos Extremos</button>
        </div>
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

async function analyzeExtremePhenomena() {
    if (!currentWeatherData || !currentCity) {
        alert('Por favor, busque o clima de uma cidade primeiro.');
        return;
    }

    const phenomenaElement = document.getElementById('extreme-phenomena');
    const loadingElement = document.getElementById('loading');
    const phenomenaBtn = document.querySelector('.phenomena-btn');
    
    // Show loading state
    phenomenaElement.style.display = 'block';
    phenomenaElement.innerHTML = `
        <div class="phenomena-container">
            <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
            <p class="loading">Analisando condições atmosféricas com IA...</p>
        </div>
    `;
    loadingElement.style.display = 'block';
    
    // Disable button during analysis
    if (phenomenaBtn) {
        phenomenaBtn.disabled = true;
        phenomenaBtn.innerHTML = '🔄 Analisando...';
    }

    try {
        // Get forecast data if not already available
        let forecastData = null;
        if (currentWeatherData.coord) {
            try {
                const forecastResponse = await fetch(`/api/forecast?city=${encodeURIComponent(currentCity)}`);
                if (forecastResponse.ok) {
                    forecastData = await forecastResponse.json();
                }
            } catch (error) {
                console.error('Erro ao obter previsão:', error);
            }
        }

        const response = await fetch('/api/ai/extreme-phenomena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                weatherData: currentWeatherData,
                forecastData: forecastData,
                city: currentCity
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao analisar fenômenos extremos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        displayExtremePhenomena(data);
        
        // Scroll to phenomena section
        phenomenaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Erro ao analisar fenômenos extremos:', error);
        phenomenaElement.innerHTML = `
            <div class="phenomena-container">
                <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
                <p class="error-message">
                    ${error.message || 'Erro inesperado ao analisar fenômenos. Por favor, tente novamente mais tarde.'}
                </p>
            </div>
        `;
    } finally {
        loadingElement.style.display = 'none';
        
        // Re-enable button
        if (phenomenaBtn) {
            phenomenaBtn.disabled = false;
            phenomenaBtn.innerHTML = '🌍 Fenômenos Extremos';
        }
    }
}

function displayAirQuality(data) {
    const airQualityElement = document.getElementById('air-quality');

    if (!data.list || data.list.length === 0) {
        return;
    }

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const aqiLevels = {
        1: { label: 'Bom', color: '#4fd1c5', description: 'Qualidade do ar satisfatória' },
        2: { label: 'Moderado', color: '#f6e05e', description: 'Qualidade do ar aceitável' },
        3: { label: 'Ruim para grupos sensíveis', color: '#ed8936', description: 'Pode afetar pessoas sensíveis' },
        4: { label: 'Ruim', color: '#f56565', description: 'Pode afetar toda a população' },
        5: { label: 'Muito Ruim', color: '#c53030', description: 'Alerta de saúde' }
    };

    const level = aqiLevels[aqi] || aqiLevels[1];

    const htmlContent = `
        <div class="air-quality-container">
            <h3>🌬️ Qualidade do Ar</h3>
            <div class="aqi-display">
                <div class="aqi-badge" style="background-color: ${level.color}">
                    <span class="aqi-value">${aqi}</span>
                    <span class="aqi-label">${level.label}</span>
                </div>
                <p class="aqi-description">${level.description}</p>
            </div>
            <div class="pollutants-grid">
                <div class="pollutant-item">
                    <span class="pollutant-name">PM2.5</span>
                    <span class="pollutant-value">${components.pm2_5} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">PM10</span>
                    <span class="pollutant-value">${components.pm10} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">O₃</span>
                    <span class="pollutant-value">${components.o3} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">NO₂</span>
                    <span class="pollutant-value">${components.no2} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">SO₂</span>
                    <span class="pollutant-value">${components.so2} µg/m³</span>
                </div>
                <div class="pollutant-item">
                    <span class="pollutant-name">CO</span>
                    <span class="pollutant-value">${components.co} µg/m³</span>
                </div>
            </div>
        </div>
    `;

    airQualityElement.innerHTML = htmlContent;
    airQualityElement.style.display = 'block';
}

function displayUVIndex(data) {
    const uvElement = document.getElementById('uv-index');

    if (!data.value) {
        return;
    }

    const uv = data.value;

    const uvLevels = {
        low: { max: 2.9, label: 'Baixo', color: '#4fd1c5', protection: 'Sem proteção necessária' },
        moderate: { max: 5.9, label: 'Moderado', color: '#f6e05e', protection: 'Use proteção em horários de pico' },
        high: { max: 7.9, label: 'Alto', color: '#ed8936', protection: 'Use protetor solar e chapéu' },
        veryHigh: { max: 10.9, label: 'Muito Alto', color: '#f56565', protection: 'Proteção extra necessária' },
        extreme: { max: Infinity, label: 'Extremo', color: '#c53030', protection: 'Evite exposição solar' }
    };

    let level = uvLevels.low;
    for (const [key, value] of Object.entries(uvLevels)) {
        if (uv <= value.max) {
            level = value;
            break;
        }
    }

    const htmlContent = `
        <div class="uv-container">
            <h3>☀️ Índice UV</h3>
            <div class="uv-display">
                <div class="uv-badge" style="background-color: ${level.color}">
                    <span class="uv-value">${uv.toFixed(1)}</span>
                    <span class="uv-label">${level.label}</span>
                </div>
                <p class="uv-protection">${level.protection}</p>
            </div>
        </div>
    `;

    uvElement.innerHTML = htmlContent;
    uvElement.style.display = 'block';
}

function displayHourlyForecast(data) {
    const hourlyElement = document.getElementById('hourly-forecast');

    if (!data.hourly || data.hourly.length === 0) {
        return;
    }

    const next24Hours = data.hourly.slice(0, 24);

    const htmlContent = `
        <div class="hourly-forecast-container">
            <h3>⏰ Previsão por Hora (24h)</h3>
            <div class="hourly-grid">
                ${next24Hours.map(hour => `
                    <div class="hourly-item">
                        <p class="hourly-time">${new Date(hour.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png"
                             alt="${hour.weather[0].description}"
                             class="hourly-icon">
                        <p class="hourly-temp">${Math.round(hour.temp)}°C</p>
                        <p class="hourly-desc">${hour.weather[0].description}</p>
                        <p class="hourly-humidity">💧 ${hour.humidity}%</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    hourlyElement.innerHTML = htmlContent;
    hourlyElement.style.display = 'block';
}

function displayExtremePhenomena(data) {
    const phenomenaElement = document.getElementById('extreme-phenomena');

    if (!data.phenomena || data.phenomena.length === 0) {
        phenomenaElement.innerHTML = `
            <div class="phenomena-container">
                <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
                <p class="phenomena-summary">${data.summary || 'Nenhum fenômeno extremo detectado no momento.'}</p>
            </div>
        `;
        phenomenaElement.style.display = 'block';
        return;
    }

    const dangerColors = {
        'BAIXO': '#4fd1c5',
        'MÉDIO': '#f6e05e',
        'ALTO': '#ed8936',
        'EXTREMO': '#c53030'
    };

    // Check for high danger phenomena and trigger alerts
    const highDangerPhenomena = data.phenomena.filter(p => 
        p.dangerLevel === 'ALTO' || p.dangerLevel === 'EXTREMO'
    );

    if (highDangerPhenomena.length > 0) {
        triggerDangerAlert(highDangerPhenomena);
    }

    const htmlContent = `
        <div class="phenomena-container">
            <h3>🌍 Fenômenos Atmosféricos Extremos</h3>
            <p class="phenomena-summary">${data.summary}</p>
            <div class="phenomena-grid">
                ${data.phenomena.map(phenomenon => `
                    <div class="phenomenon-card ${phenomenon.dangerLevel === 'ALTO' || phenomenon.dangerLevel === 'EXTREMO' ? 'phenomenon-card--dangerous' : ''}" style="border-left: 4px solid ${dangerColors[phenomenon.dangerLevel] || '#4fd1c5'}">
                        <div class="phenomenon-header">
                            <h4 class="phenomenon-name">${phenomenon.name}</h4>
                            <span class="phenomenon-danger" style="background-color: ${dangerColors[phenomenon.dangerLevel] || '#4fd1c5'}">${phenomenon.dangerLevel}</span>
                        </div>
                        <p class="phenomenon-description">${phenomenon.description}</p>
                        <div class="phenomenon-recommendations">
                            <p class="recommendations-title">🛡️ Recomendações:</p>
                            <ul class="recommendations-list">
                                ${phenomenon.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    phenomenaElement.innerHTML = htmlContent;
    phenomenaElement.style.display = 'block';
}

function triggerDangerAlert(phenomena) {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        phenomena.forEach(phenomenon => {
            new Notification(`⚠️ Alerta de Perigo: ${phenomenon.name}`, {
                body: `${phenomenon.description}\n\nNível: ${phenomenon.dangerLevel}`,
                icon: '/favicon.ico',
                tag: 'weather-danger'
            });
        });
    }

    // Add visual alert banner
    const alertBanner = document.createElement('div');
    alertBanner.className = 'danger-alert-banner';
    alertBanner.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">⚠️</span>
            <div class="alert-message">
                <strong>Alerta de Fenômenos Perigosos</strong>
                <p>${phenomena.map(p => p.name).join(', ')} detectados em ${currentCity}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    
    document.body.appendChild(alertBanner);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (alertBanner.parentElement) {
            alertBanner.remove();
        }
    }, 10000);

    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecentSearches();
});
