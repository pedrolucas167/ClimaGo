# API Documentation - ClimaGo

Documentação completa da API do ClimaGo para integração e desenvolvimento.

## Base URL

```
http://localhost:3000/api
```

## Autenticação

A API utiliza chaves de API configuradas via variáveis de ambiente:
- `OPENWEATHER_API_KEY`: Para dados meteorológicos (OpenWeatherMap)
- `OPENROUTER_API_KEY`: Para funcionalidades de IA (OpenRouter)

## Endpoints

### 🌤️ Clima

#### Obter clima por cidade

Retorna os dados climáticos atuais de uma cidade específica.

```http
GET /api/weather?city={city}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| city | string | Sim | Nome da cidade |

**Exemplo:**
```http
GET /api/weather?city=São%20Paulo
```

**Resposta (200 OK):**
```json
{
  "coord": {
    "lon": -46.6361,
    "lat": -23.5505
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "céu limpo",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 25.5,
    "feels_like": 26.2,
    "temp_min": 24.1,
    "temp_max": 27.3,
    "pressure": 1015,
    "humidity": 65
  },
  "visibility": 10000,
  "wind": {
    "speed": 3.6,
    "deg": 120
  },
  "clouds": {
    "all": 0
  },
  "dt": 1691234567,
  "sys": {
    "type": 1,
    "id": 8394,
    "country": "BR",
    "sunrise": 1691200000,
    "sunset": 1691240000
  },
  "timezone": -10800,
  "id": 3448439,
  "name": "São Paulo",
  "cod": 200,
  "cached": false
}
```

**Erros:**
- `400 Bad Request`: Cidade não fornecida ou inválida
- `500 Internal Server Error`: Erro ao buscar dados do clima

---

#### Obter clima por coordenadas

Retorna os dados climáticos atuais baseados em coordenadas geográficas.

```http
GET /api/weather/coords?lat={lat}&lon={lon}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| lat | number | Sim | Latitude |
| lon | number | Sim | Longitude |

**Exemplo:**
```http
GET /api/weather/coords?lat=-23.5505&lon=-46.6361
```

**Resposta:** Mesmo formato do endpoint `/api/weather`

**Erros:**
- `400 Bad Request`: Coordenadas não fornecidas
- `500 Internal Server Error`: Erro ao buscar dados do clima

---

### 📅 Previsão

#### Obter previsão de 5 dias

Retorna a previsão do tempo para os próximos 5 dias.

```http
GET /api/forecast?city={city}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| city | string | Sim | Nome da cidade |

**Exemplo:**
```http
GET /api/forecast?city=Rio%20de%20Janeiro
```

**Resposta (200 OK):**
```json
{
  "cod": "200",
  "message": 0,
  "cnt": 40,
  "list": [
    {
      "dt": 1691234567,
      "main": {
        "temp": 24.5,
        "feels_like": 25.1,
        "temp_min": 23.2,
        "temp_max": 25.8,
        "pressure": 1014,
        "humidity": 70
      },
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "chuva leve",
          "icon": "10d"
        }
      ],
      "clouds": {
        "all": 75
      },
      "wind": {
        "speed": 4.1,
        "deg": 130
      },
      "visibility": 10000,
      "pop": 0.4,
      "dt_txt": "2023-08-05 12:00:00"
    }
  ],
  "city": {
    "id": 3451190,
    "name": "Rio de Janeiro",
    "coord": {
      "lat": -22.9068,
      "lon": -43.1729
    },
    "country": "BR",
    "population": 6747815,
    "timezone": -10800,
    "sunrise": 1691200000,
    "sunset": 1691240000
  }
}
```

**Erros:**
- `400 Bad Request`: Cidade não fornecida ou inválida
- `500 Internal Server Error`: Erro ao buscar previsão

---

#### Obter dados completos (One Call)

Retorna dados meteorológicos completos incluindo previsão horária.

```http
GET /api/onecall?lat={lat}&lon={lon}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| lat | number | Sim | Latitude |
| lon | number | Sim | Longitude |

**Exemplo:**
```http
GET /api/onecall?lat=-23.5505&lon=-46.6361
```

**Resposta (200 OK):**
```json
{
  "lat": -23.5505,
  "lon": -46.6361,
  "timezone": "America/Sao_Paulo",
  "timezone_offset": -10800,
  "current": {
    "dt": 1691234567,
    "sunrise": 1691200000,
    "sunset": 1691240000,
    "temp": 25.5,
    "feels_like": 26.2,
    "pressure": 1015,
    "humidity": 65,
    "uvi": 5.2,
    "clouds": 0,
    "visibility": 10000,
    "wind_speed": 3.6,
    "wind_deg": 120
  },
  "hourly": [
    {
      "dt": 1691234567,
      "temp": 25.5,
      "feels_like": 26.2,
      "pressure": 1015,
      "humidity": 65,
      "uvi": 5.2,
      "clouds": 0,
      "visibility": 10000,
      "wind_speed": 3.6,
      "wind_deg": 120,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "céu limpo",
          "icon": "01d"
        }
      ]
    }
  ],
  "daily": [
    {
      "dt": 1691234567,
      "sunrise": 1691200000,
      "sunset": 1691240000,
      "temp": {
        "day": 25.5,
        "min": 18.2,
        "max": 27.3,
        "night": 19.1,
        "eve": 24.8,
        "morn": 20.5
      },
      "pressure": 1015,
      "humidity": 65,
      "uvi": 5.2
    }
  ]
}
```

**Erros:**
- `400 Bad Request`: Coordenadas não fornecidas
- `500 Internal Server Error`: Erro ao buscar dados completos

---

### 🌬️ Qualidade do Ar

#### Obter qualidade do ar atual

Retorna dados sobre a qualidade do ar atual.

```http
GET /api/air-pollution?lat={lat}&lon={lon}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| lat | number | Sim | Latitude |
| lon | number | Sim | Longitude |

**Exemplo:**
```http
GET /api/air-pollution?lat=-23.5505&lon=-46.6361
```

**Resposta (200 OK):**
```json
{
  "coord": {
    "lon": -46.6361,
    "lat": -23.5505
  },
  "list": [
    {
      "dt": 1691234567,
      "aqi": 2,
      "components": {
        "co": 450.2,
        "no": 12.5,
        "no2": 25.3,
        "o3": 45.8,
        "so2": 8.1,
        "pm2_5": 12.4,
        "pm10": 18.7,
        "nh3": 5.2
      }
    }
  ]
}
```

**Índice AQI:**
- 1: Bom
- 2: Moderado
- 3: Ruim para grupos sensíveis
- 4: Ruim
- 5: Muito Ruim

**Erros:**
- `400 Bad Request`: Coordenadas não fornecidas
- `500 Internal Server Error`: Erro ao buscar dados de poluição

---

#### Obter previsão de qualidade do ar

Retorna previsão de qualidade do ar para os próximos dias.

```http
GET /api/air-pollution/forecast?lat={lat}&lon={lon}
```

**Parâmetros:** Mesmos do endpoint anterior

**Resposta:** Formato similar ao endpoint `/api/air-pollution`

---

### ☀️ Índice UV

#### Obter índice UV atual

Retorna o índice UV atual da localização.

```http
GET /api/uv-index?lat={lat}&lon={lon}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| lat | number | Sim | Latitude |
| lon | number | Sim | Longitude |

**Exemplo:**
```http
GET /api/uv-index?lat=-23.5505&lon=-46.6361
```

**Resposta (200 OK):**
```json
{
  "lat": -23.5505,
  "lon": -46.6361,
  "dt": 1691234567,
  "uvi": 5.2
}
```

**Classificação UV:**
- 0-2.9: Baixo
- 3.0-5.9: Moderado
- 6.0-7.9: Alto
- 8.0-10.9: Muito Alto
- 11+: Extremo

**Erros:**
- `400 Bad Request`: Coordenadas não fornecidas
- `500 Internal Server Error`: Erro ao buscar índice UV

---

### 🗺️ Geocoding

#### Obter coordenadas por cidade

Retorna as coordenadas geográficas de uma cidade.

```http
GET /api/geocoding?city={city}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| city | string | Sim | Nome da cidade |

**Exemplo:**
```http
GET /api/geocoding?city=Brasília
```

**Resposta (200 OK):**
```json
[
  {
    "name": "Brasília",
    "lat": -15.7975,
    "lon": -47.8919,
    "country": "BR",
    "state": "DF"
  }
]
```

**Erros:**
- `400 Bad Request`: Cidade não fornecida
- `500 Internal Server Error`: Erro ao buscar localização

---

#### Obter nome da cidade por coordenadas

Retorna o nome da cidade baseado em coordenadas.

```http
GET /api/reverse-geocoding?lat={lat}&lon={lon}
```

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| lat | number | Sim | Latitude |
| lon | number | Sim | Longitude |

**Exemplo:**
```http
GET /api/reverse-geocoding?lat=-23.5505&lon=-46.6361
```

**Resposta (200 OK):**
```json
[
  {
    "name": "São Paulo",
    "lat": -23.5505,
    "lon": -46.6361,
    "country": "BR",
    "state": "SP"
  }
]
```

**Erros:**
- `400 Bad Request`: Coordenadas não fornecidas
- `500 Internal Server Error`: Erro ao buscar nome da cidade

---

### 🤖 Inteligência Artificial

#### Obter recomendações climáticas

Retorna recomendações personalizadas baseadas nos dados climáticos atuais.

```http
POST /api/ai/weather-advice
Content-Type: application/json
```

**Body:**

```json
{
  "weatherData": {
    "main": {
      "temp": 25.5,
      "feels_like": 26.2,
      "humidity": 65,
      "pressure": 1015
    },
    "wind": {
      "speed": 3.6
    },
    "weather": [
      {
        "description": "céu limpo"
      }
    ]
  },
  "city": "São Paulo"
}
```

**Resposta (200 OK):**
```json
{
  "advice": "Vestuário: Roupas leves e confortáveis são ideais para esta temperatura.\n\nAtividades: Ótimo dia para atividades ao ar livre como caminhadas, corridas ou piqueniques.\n\nPrecauções: Use protetor solar com FPS 30+, pois o índice UV está moderado. Mantenha-se hidratado.\n\nDicas de saúde: A umidade está confortável, mas evite exposição prolongada ao sol entre 10h e 16h."
}
```

**Erros:**
- `400 Bad Request`: Dados do clima ou cidade não fornecidos
- `500 Internal Server Error`: Erro ao obter recomendações de IA

---

#### Detectar fenômenos extremos

Analisa dados climáticos para detectar fenômenos atmosféricos extremos.

```http
POST /api/ai/extreme-phenomena
Content-Type: application/json
```

**Body:**

```json
{
  "weatherData": {
    "main": {
      "temp": 25.5,
      "pressure": 1015
    },
    "wind": {
      "speed": 3.6,
      "deg": 120
    },
    "weather": [
      {
        "id": 800,
        "description": "céu limpo"
      }
    ],
    "visibility": 10000
  },
  "forecastData": {
    "list": []
  },
  "city": "São Paulo"
}
```

**Resposta (200 OK):**
```json
{
  "phenomena": [],
  "summary": "Condições atmosféricas normais. Não foram detectados fenômenos extremos na região."
}
```

**Resposta com fenômenos detectados:**
```json
{
  "phenomena": [
    {
      "name": "Tempestade Severa",
      "dangerLevel": "ALTO",
      "description": "Condições favoráveis para formação de tempestades severas com raios e chuva intensa.",
      "recommendations": [
        "Busque abrigo imediatamente",
        "Evite áreas abertas e objetos metálicos",
        "Mantenha-se afastado de janelas"
      ]
    }
  ],
  "summary": "Detectada tempestade severa na região. Nível de perigo: ALTO"
}
```

**Níveis de Perigo:**
- `BAIXO`: Condições normais ou levemente adversas
- `MÉDIO`: Condições que requerem atenção
- `ALTO`: Condições perigosas que requerem precauções
- `EXTREMO`: Condições muito perigosas que requerem ação imediata

**Erros:**
- `400 Bad Request`: Dados do clima ou cidade não fornecidos
- `500 Internal Server Error`: Erro ao analisar fenômenos extremos

---

## Cache

A API implementa um sistema de cache inteligente para reduzir chamadas às APIs externas:

- **Duração do cache**: 10 minutos
- **Indicador de cache**: Respostas em cache incluem o campo `cached: true`
- **Limpeza automática**: Cache é limpo automaticamente a cada 5 minutos

## Rate Limiting

Atualmente não há rate limiting implementado, mas recomenda-se implementar em produção para evitar abuso.

## Erros

Todos os erros seguem este formato:

```json
{
  "error": "Descrição do erro"
}
```

**Códigos de erro comuns:**
- `400 Bad Request`: Parâmetros inválidos ou ausentes
- `500 Internal Server Error`: Erro no servidor ou nas APIs externas

## Exemplos de Uso

### JavaScript (Fetch)

```javascript
// Obter clima por cidade
fetch('http://localhost:3000/api/weather?city=São Paulo')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));

// Obter recomendações de IA
fetch('http://localhost:3000/api/ai/weather-advice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    weatherData: weatherData,
    city: 'São Paulo'
  })
})
  .then(response => response.json())
  .then(data => console.log(data.advice))
  .catch(error => console.error('Erro:', error));
```

### cURL

```bash
# Obter clima por cidade
curl "http://localhost:3000/api/weather?city=São%20Paulo"

# Obter clima por coordenadas
curl "http://localhost:3000/api/weather/coords?lat=-23.5505&lon=-46.6361"

# Obter previsão
curl "http://localhost:3000/api/forecast?city=Rio%20de%20Janeiro"

# Obter qualidade do ar
curl "http://localhost:3000/api/air-pollution?lat=-23.5505&lon=-46.6361"

# Obter índice UV
curl "http://localhost:3000/api/uv-index?lat=-23.5505&lon=-46.6361"

# Obter recomendações de IA
curl -X POST http://localhost:3000/api/ai/weather-advice \
  -H "Content-Type: application/json" \
  -d '{"weatherData": {...}, "city": "São Paulo"}'
```

## Suporte

Para dúvidas ou problemas, abra uma issue no [GitHub](https://github.com/pedrolucas167/ClimaGo/issues).
