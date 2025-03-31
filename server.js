const express = require('express');
const axios = require('axios');
const app = express();

const API_KEY = '9d28a700c32e8520fe80437e5ee16db8'; // Substitua pela sua chave da OpenWeatherMap

app.use(express.json()); // Para parsing de JSON, caso precise no futuro

app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'Cidade não fornecida' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt`;

    try {
        const response = await axios.get(url);
        res.json(response.data); // Envia os dados diretamente para o front-end
    } catch (error) {
        console.error('Erro na API:', error.message);
        res.status(500).json({ error: 'Erro ao buscar dados do clima' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});