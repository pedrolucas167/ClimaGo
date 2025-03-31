require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const app = express();

const API_KEY = process.env.OPENWEATHER_API_KEY;


app.use(morgan('dev')); // Loga as requisições HTTP

app.use(express.json()); // P

// Função para buscar clima da cidade
const getWeather = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Erro desconhecido');
    }
};

app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

 
    if (!city || city.trim() === '') {
        return res.status(400).json({ error: 'Cidade não fornecida ou inválida' });
    }

    try {
        const weatherData = await getWeather(city);
        res.json(weatherData);
    } catch (error) {
        console.error('Erro na API:', error.message);
        res.status(500).json({ error: `Erro ao buscar dados do clima: ${error.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
