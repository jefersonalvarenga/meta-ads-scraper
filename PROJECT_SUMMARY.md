# Facebook Page Scraper - Project Summary

## 📋 Overview

Actor do Apify para extrair dados detalhados de páginas do Facebook, retornando informações estruturadas incluindo likes, followers, categoria, contato, avaliações e status de anúncios.

## 🗂️ Estrutura do Projeto

```
meta-ads-actor/
├── .actor/                    # Configuração do Apify
│   ├── actor.json            # Metadados do actor
│   ├── input_schema.json     # Schema de validação do input
│   ├── INPUT.json            # Exemplo de input
│   └── DEPLOYMENT.md         # Guia de deploy detalhado
├── .claude/                   # Configuração do Claude Code
├── src/                       # Código fonte
│   ├── main.js               # Entry point e crawler setup
│   └── extractors.js         # Lógica de extração de dados
├── Dockerfile                 # Container para deploy
├── package.json              # Dependências e scripts
├── apify.json                # Configuração do Apify CLI
├── test-local.js             # Script de teste local
├── .gitignore                # Arquivos ignorados pelo git
├── .env.example              # Exemplo de variáveis de ambiente
├── README.md                 # Documentação principal
├── QUICKSTART.md             # Guia rápido em português
└── PROJECT_SUMMARY.md        # Este arquivo

```

## 🎯 Features Implementadas

### Input Configuration
✅ URLs de páginas do Facebook
✅ Tipo de resultado (details/basic)
✅ Limite de páginas a processar
✅ Configuração de proxy (Apify residential)
✅ Custom user data (search_run_id)
✅ Opções de scraping (posts, about, reviews)
✅ Concorrência configurável
✅ Timeout configurável
✅ Debug logging

### Data Extraction
✅ URL da página do Facebook
✅ Título da página
✅ Categorias
✅ Número de likes
✅ Número de followers
✅ Telefone de contato
✅ Sites vinculados
✅ Biografia/introdução
✅ Foto de perfil (URL)
✅ Avaliações (rating text e numérico)
✅ Quantidade de reviews
✅ Data de criação da página
✅ Status de anúncios
✅ IDs (pageId, facebookId)
✅ Ad Library info
✅ Custom search_run_id propagation

## 📥 Input Example

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/337202632811202" }
  ],
  "resultsType": "details",
  "maxRequestsPerCrawl": 6,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  },
  "userData": {
    "search_run_id": "57ff728d-b280-4814-9685-c32df05216b8"
  },
  "scrapePosts": false,
  "scrapeAbout": true,
  "scrapeReviews": false,
  "maxConcurrency": 6,
  "pageLoadTimeoutSecs": 60,
  "debugLog": false
}
```

## 📤 Output Example

```json
{
  "facebookUrl": "https://www.facebook.com/337202632811202",
  "search_run_id": "57ff728d-b280-4814-9685-c32df05216b8",
  "categories": ["Page", "Plastic Surgeon"],
  "info": ["Dr. Felipe Queiroz. 72 likes", "⚜️ Permita-se..."],
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

## 🚀 Como Usar

### Instalação Local
```bash
npm install
npm test  # Teste com browser visível
```

### Deploy no Apify
```bash
# Via CLI
apify login
apify push

# Via GitHub
git remote add origin <your-repo-url>
git push -u origin main
# Depois conecte no Apify Console
```

## 🔧 Tecnologias

- **Apify SDK** v3.1.0 - Framework para web scraping
- **Playwright** v1.40.0 - Automação de browser
- **Node.js** 20+ - Runtime (ES Modules)
- **Docker** - Containerização

## 📝 Scripts Disponíveis

```bash
npm start           # Executa o actor
npm run dev         # Executa com Apify CLI
npm test            # Teste local (browser visível)
npm run test:headless  # Teste headless
```

## ⚙️ Configurações Importantes

### Proxies
**Recomendação forte**: Use proxies residenciais do Apify para evitar bloqueios.

```json
{
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

### Concorrência
Para melhores resultados, use concorrência moderada (5-10).

```json
{
  "maxConcurrency": 6
}
```

### Timeouts
Páginas do Facebook podem ser lentas. Use timeouts generosos.

```json
{
  "pageLoadTimeoutSecs": 60
}
```

## 🐛 Troubleshooting

### Dados incompletos
- ✅ Use proxies residenciais
- ✅ Verifique se a página é pública
- ✅ Aumente o timeout
- ✅ Ative debug logging

### Rate limiting
- ✅ Reduza concorrência
- ✅ Use proxies residenciais
- ✅ Adicione delays entre requests

### Erros de parsing
- ✅ Facebook pode mudar HTML - verifique extractors.js
- ✅ Ative debug para ver HTML retornado

## 📄 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `src/main.js` | Setup do crawler, configuração de proxy, routing |
| `src/extractors.js` | Lógica de extração de dados do DOM |
| `.actor/input_schema.json` | Validação e documentação do input |
| `.actor/actor.json` | Metadados e configuração do actor |
| `Dockerfile` | Build do container para Apify |
| `test-local.js` | Script de teste local |

## 🔒 Limitações

- Páginas privadas ou com login requerido podem ter dados limitados
- A estrutura HTML do Facebook pode mudar (requer manutenção)
- Rate limiting do Facebook exige uso de proxies
- Alguns campos podem estar null se não disponíveis

## 🎯 Próximos Passos Sugeridos

1. ✅ Deploy no Apify
2. ⬜ Testar com múltiplas páginas
3. ⬜ Adicionar extração de posts (se scrapePosts=true)
4. ⬜ Adicionar extração de reviews (se scrapeReviews=true)
5. ⬜ Melhorar tratamento de erros
6. ⬜ Adicionar retry logic
7. ⬜ Adicionar métricas de performance

## 📞 Suporte

- GitHub Issues: Para reportar bugs ou sugestões
- Documentação Apify: https://docs.apify.com
- Playwright Docs: https://playwright.dev

## 📜 License

ISC

---

**Criado com Claude Code** 🤖
