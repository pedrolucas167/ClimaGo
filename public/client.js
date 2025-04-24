async function getWeather() {
    const cityInput = document.getElementById('city');
    const loadingElement = document.getElementById('loading');
    const weatherElement = document.getElementById('weather');
    const city = cityInput.value.trim();

    if (!city) {
        alert('Por favor, digite o nome de uma cidade.');
        return;
    }

    // Mostrar carregamento
    loadingElement.style.display = 'block';
    weatherElement.innerHTML = '';

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || 'Erro ao buscar dados meteorológicos.';
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const { name, sys, main, weather, wind } = data;

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
            </div>
            <div class="weather-details">
                <p><strong>Sensação Térmica:</strong> ${Math.round(main.feels_like)}°C</p>
                <p><strong>Umidade:</strong> ${main.humidity}%</p>
                <p><strong>Pressão:</strong> ${main.pressure} hPa</p>
                <p><strong>Vento:</strong> ${wind.speed} m/s</p>
            </div>
        `;

        weatherElement.innerHTML = htmlContent;
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
