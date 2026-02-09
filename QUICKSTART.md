# Quick Start Guide

## Overview

Este scraper extrai informações detalhadas de páginas do Facebook, retornando dados estruturados como likes, followers, categoria, telefone, ratings e muito mais.

## Estrutura do Projeto

```
meta-ads-actor/
├── .actor/
│   ├── actor.json          # Configuração do actor
│   ├── input_schema.json   # Schema de input
│   ├── INPUT.json          # Exemplo de input
│   └── DEPLOYMENT.md       # Guia de deploy
├── src/
│   ├── main.js            # Código principal
│   └── extractors.js      # Lógica de extração
├── Dockerfile             # Container configuration
├── package.json           # Dependencies
└── README.md             # Documentation
```

## Input Format

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/PAGE_ID" }
  ],
  "resultsType": "details",
  "maxRequestsPerCrawl": 6,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  },
  "userData": {
    "search_run_id": "your-custom-id"
  },
  "scrapePosts": false,
  "scrapeAbout": true,
  "scrapeReviews": false,
  "maxConcurrency": 6,
  "pageLoadTimeoutSecs": 60,
  "debugLog": false
}
```

## Output Format

```json
{
  "facebookUrl": "https://www.facebook.com/337202632811202",
  "search_run_id": "57ff728d-b280-4814-9685-c32df05216b8",
  "categories": ["Page", "Plastic Surgeon"],
  "info": ["Dr. Felipe Queiroz. 72 likes", "..."],
  "likes": 72,
  "messenger": null,
  "title": "Dr. Felipe Queiroz",
  "pageId": "61560710889601",
  "pageName": "people",
  "pageUrl": "https://www.facebook.com/337202632811202",
  "intro": "⚜️ Permita-se ser a sua melhor versão...",
  "websites": [],
  "phone": "+55 21 97366-3457",
  "rating": "Not yet rated (0 Reviews)",
  "followers": 72,
  "followings": 0,
  "profilePictureUrl": "https://scontent-sjc6-1.xx.fbcdn.net/...",
  "profilePhoto": "https://www.facebook.com/photo/?fbid=...",
  "ratingOverall": null,
  "ratingCount": 0,
  "category": "Plastic Surgeon",
  "ratings": "Not yet rated (0 Reviews)",
  "creation_date": "June 12, 2024",
  "ad_status": "This Page is currently running ads.",
  "facebookId": "61560710889601",
  "pageAdLibrary": {
    "is_business_page_active": false,
    "id": "337202632811202"
  }
}
```

## Instalação Local

1. Instalar dependências:
```bash
npm install
```

2. Configurar ambiente (opcional):
```bash
cp .env.example .env
# Editar .env e adicionar APIFY_TOKEN se necessário
```

3. Executar localmente:
```bash
npm start
```

Ou com Apify CLI:
```bash
npm install -g apify-cli
apify login
apify run
```

## Deploy no Apify

### Via CLI:
```bash
apify login
apify push
```

### Via GitHub:
1. Push para GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/meta-ads-actor.git
git push -u origin main
```

2. No Apify Console:
   - Actors > Create new > Import from GitHub
   - Conecte o repositório
   - Deploy automaticamente

## Configuração de Proxy

**Importante**: É altamente recomendado usar proxies residenciais para evitar bloqueios do Facebook.

```json
{
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

## Campos Extraídos

- ✅ `facebookUrl`: URL da página
- ✅ `title`: Nome da página
- ✅ `category`: Categoria principal
- ✅ `categories`: Array de categorias
- ✅ `likes`: Número de likes
- ✅ `followers`: Número de seguidores
- ✅ `phone`: Telefone de contato
- ✅ `intro`: Biografia/descrição
- ✅ `websites`: Sites vinculados
- ✅ `rating`: Avaliação textual
- ✅ `ratingOverall`: Nota numérica
- ✅ `ratingCount`: Quantidade de avaliações
- ✅ `profilePictureUrl`: URL da foto de perfil
- ✅ `creation_date`: Data de criação da página
- ✅ `ad_status`: Status de anúncios
- ✅ `pageId`: ID da página
- ✅ `facebookId`: ID do Facebook
- ✅ `search_run_id`: ID customizado (do userData)

## Limitações

- Algumas páginas podem exigir login para acesso completo
- A extração depende da estrutura HTML do Facebook (pode mudar)
- Proxies residenciais são recomendados para evitar rate limiting
- Nem todos os campos estarão disponíveis para todas as páginas

## Troubleshooting

### Erro: "No start URLs provided"
Certifique-se de que o input contém o campo `startUrls` com pelo menos uma URL.

### Erro: "Timeout"
Aumente o `pageLoadTimeoutSecs` no input.

### Dados incompletos
- Verifique se a página é pública
- Use proxies residenciais
- Ative `debugLog: true` para mais informações

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub.
