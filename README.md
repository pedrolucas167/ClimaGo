# ClimaGo

![image](https://github.com/user-attachments/assets/0adc087f-3f31-40e9-a77b-1f2317c3caa7)
 

ClimaGo é um aplicativo web robusto que permite consultar o clima em tempo real de qualquer cidade usando a API da OpenWeatherMap. Construído com Node.js, Express e uma interface moderna em HTML/JavaScript, ele oferece funcionalidades avançadas como atualização automática, previsão do tempo, geolocalização, cache inteligente e recomendações personalizadas alimentadas por IA.

## Funcionalidades
- **Clima em tempo real**: Consulta atual do clima por nome da cidade com indicador de última atualização.
- **Atualização automática**: Opção de atualizar os dados automaticamente a cada 5 minutos.
- **Previsão do tempo**: Exibição da previsão para os próximos 5 dias.
- **Geolocalização**: Botão para usar a localização atual do usuário automaticamente.
- **Recomendações de IA**: Análise inteligente dos dados climáticos com sugestões personalizadas de vestuário, atividades e precauções usando a OpenRouter API.
- **Cache inteligente**: Sistema de cache no servidor para reduzir chamadas à API e melhorar performance.
- **Histórico de buscas**: Armazenamento local das 5 últimas cidades pesquisadas.
- **Interface moderna**: Design responsivo com suporte a modo escuro e animações suaves.
- **Tratamento de erros**: Feedback claro para entradas inválidas ou falhas na API.

## Tecnologias Utilizadas
- **Node.js**: Ambiente de execução no servidor.
- **Express**: Framework web para o servidor.
- **Axios**: Para requisições HTTP à OpenWeatherMap e OpenRouter.
- **Dotenv**: Gerenciamento de variáveis de ambiente.
- **Morgan**: Logging de requisições HTTP.
- **HTML/CSS/JavaScript**: Interface no lado do cliente.
- **OpenWeatherMap API**: Fonte dos dados de clima e previsão.
- **OpenRouter API**: Serviço de IA para gerar recomendações personalizadas.

## Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (versão 14 ou superior recomendada).
- Uma chave de API da [OpenWeatherMap](https://openweathermap.org/).
- Uma chave de API da [OpenRouter](https://openrouter.ai/) (opcional, para funcionalidades de IA).

## Instalação
Siga os passos abaixo para rodar o ClimaGo localmente:

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/pedrolucas167/ClimaGo.git
   cd ClimaGo
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure a API Key**:
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Abra o arquivo `.env` e substitua `sua_chave_aqui` pelas suas chaves:
     ```
     OPENWEATHER_API_KEY=sua_chave_aqui
     OPENROUTER_API_KEY=sua_chave_aqui
     ```

4. **Inicie o servidor**:
   ```bash
   npm start
   ```

5. **Acesse o aplicativo**:
   Abra seu navegador e acesse `http://localhost:3000`

## Uso
- **Buscar clima por cidade**: Digite o nome da cidade e clique em "Buscar" ou pressione Enter.
- **Geolocalização**: Clique no botão 📍 para usar sua localização atual.
- **Atualização automática**: Marque a checkbox "Atualização automática" para atualizar os dados a cada 5 minutos.
- **Previsão do tempo**: A previsão para os próximos 5 dias é exibida automaticamente após buscar uma cidade.
- **Recomendações de IA**: Clique no botão "🤖 Obter Recomendações da IA" para receber sugestões personalizadas baseadas nos dados climáticos.
- **Histórico de buscas**: As 5 últimas cidades pesquisadas ficam disponíveis como botões para acesso rápido.

## API Endpoints
- `GET /api/weather?city=<cidade>` - Retorna o clima atual de uma cidade
- `GET /api/forecast?city=<cidade>` - Retorna a previsão do tempo para 5 dias
- `GET /api/weather/coords?lat=<lat>&lon=<lon>` - Retorna o clima atual por coordenadas
- `POST /api/ai/weather-advice` - Retorna recomendações personalizadas baseadas nos dados climáticos (requere OPENROUTER_API_KEY)

## Estrutura do Projeto
```
ClimaGo/
├── src/
│   └── server.js           # Servidor Express com endpoints da API
├── public/
│   ├── index.html          # Interface principal
│   ├── js/
│   │   └── client.js       # Lógica do frontend
│   └── css/
│       └── styles.css      # Estilos da interface
├── package.json            # Dependências do projeto
├── .env.example            # Exemplo de configuração de variáveis de ambiente
└── README.md               # Documentação do projeto
```

## Licença
Este projeto é open source e está disponível sob a licença MIT.
