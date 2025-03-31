async function getWeather() {
    const city = document.getElementById('city').value.trim();
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    
    if (!city) {
        alert('Por favor, digite o nome de uma cidade.');
        return;
    }

    loadingElement.style.display = 'block';
    weatherElement.innerHTML = '';
    
    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao buscar dados');
        }
        
        const data = await response.json();
        
        weatherElement.innerHTML = `
            <div class="weather-main">
                <h2>${data.name}, ${data.sys.country}</h2>
                <div class="temperature-container">
                    <span class="temperature">${Math.round(data.main.temp)}°C</span>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                         alt="${data.weather[0].description}" 
                         class="weather-icon">
                </div>
                <p class="weather-description">${data.weather[0].description}</p>
            </div>
            <div class="weather-details">
                <p><strong>Sensação Térmica:</strong> ${Math.round(data.main.feels_like)}°C</p>
                <p><strong>Umidade:</strong> ${data.main.humidity}%</p>
                <p><strong>Pressão:</strong> ${data.main.pressure} hPa</p>
                <p><strong>Vento:</strong> ${data.wind.speed} m/s</p>
            </div>
        `;
    } catch (error) {
        console.error('Erro:', error);
        weatherElement.innerHTML = `
            <p class="error-message">
                ${error.message || 'Erro ao buscar dados. Tente novamente.'}
            </p>
        `;
    } finally {
        loadingElement.style.display = 'none';
    }
}