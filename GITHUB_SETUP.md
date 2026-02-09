# GitHub Setup Guide

## 🔗 Conectando ao GitHub

### 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `meta-ads-actor` (ou outro nome de sua preferência)
3. Descrição: "Apify actor for scraping Facebook pages"
4. Escolha: **Public** ou **Private**
5. **NÃO** inicialize com README, .gitignore ou license (já temos esses arquivos)
6. Clique em "Create repository"

### 2. Conectar Repositório Local ao GitHub

Copie a URL do seu repositório (exemplo: `https://github.com/SEU_USUARIO/meta-ads-actor.git`)

Execute no terminal:

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USUARIO/meta-ads-actor.git

# Verificar remote
git remote -v

# Push para GitHub
git push -u origin main
```

Se preferir usar SSH:

```bash
# Adicionar remote origin com SSH
git remote add origin git@github.com:SEU_USUARIO/meta-ads-actor.git

# Push para GitHub
git push -u origin main
```

### 3. Verificar Upload

Acesse https://github.com/SEU_USUARIO/meta-ads-actor e verifique se todos os arquivos foram enviados.

## 🚀 Deploy no Apify via GitHub

### Opção A: Integração Automática (Recomendado)

1. Acesse https://console.apify.com/actors
2. Clique em "Create new" > "Import from Git repository"
3. Conecte sua conta do GitHub (se ainda não conectou)
4. Selecione o repositório `meta-ads-actor`
5. Escolha a branch `main`
6. Clique em "Create"
7. O Apify vai automaticamente:
   - Fazer build do Docker container
   - Configurar o actor
   - Criar a interface de input baseada no schema

### Opção B: Via Apify CLI

```bash
# Instalar Apify CLI globalmente
npm install -g apify-cli

# Login no Apify
apify login

# Push do actor
apify push
```

O CLI vai perguntar:
- Actor name: `meta-ads-actor`
- Build tag: `latest` (ou versão específica)

### Opção C: Manual

1. Acesse https://console.apify.com/actors
2. Clique em "Create new" > "Example template"
3. Na aba "Settings", vá em "Git integration"
4. Cole a URL do repositório
5. Escolha a branch `main`
6. Salve e faça build

## 📝 Configuração Adicional no Apify

### 1. Configurar Proxy

No Apify Console, vá em "Settings" do seu actor:
- Certifique-se de ter acesso a proxies residenciais
- Configure o default proxy group se necessário

### 2. Variáveis de Ambiente (Opcional)

Se precisar de variáveis de ambiente:
1. Vá em "Settings" > "Environment variables"
2. Adicione as variáveis necessárias

### 3. Webhook (Opcional)

Para notificações quando o scraping terminar:
1. Vá em "Settings" > "Webhooks"
2. Configure um webhook para `ACTOR.RUN.SUCCEEDED`

## 🧪 Testar o Actor no Apify

1. Vá para a página do seu actor
2. Clique em "Try it"
3. Use o input de exemplo:

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/337202632811202" }
  ],
  "resultsType": "details",
  "maxRequestsPerCrawl": 1,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  },
  "userData": {
    "search_run_id": "test-run-001"
  },
  "scrapeAbout": true,
  "maxConcurrency": 1,
  "pageLoadTimeoutSecs": 60,
  "debugLog": true
}
```

4. Clique em "Start"
5. Monitore o log
6. Verifique os resultados no dataset

## 🔄 Workflow de Desenvolvimento

### Fazer Mudanças

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm test

# 3. Commit
git add .
git commit -m "Descrição da mudança"

# 4. Push para GitHub
git push

# 5. No Apify, fazer novo build (se integração automática estiver ativa, é automático)
```

### Versões

Para criar versões:

```bash
# Atualizar version no package.json
npm version patch  # 1.0.0 -> 1.0.1
# ou
npm version minor  # 1.0.0 -> 1.1.0
# ou
npm version major  # 1.0.0 -> 2.0.0

# Criar tag
git push --tags

# No Apify, criar build com a tag específica
```

## 🔐 Segurança

### .gitignore já configurado

O arquivo `.gitignore` já está configurado para **não** enviar:
- `node_modules/`
- `apify_storage/`
- `.env` (segredos)
- `*.log`
- `.DS_Store`

### NUNCA commite:
- ❌ Tokens de API
- ❌ Senhas
- ❌ Chaves privadas
- ❌ Credenciais

Use variáveis de ambiente no Apify Console.

## 📊 Monitoramento

### Ver Runs no Apify
https://console.apify.com/actors/SEU_ACTOR_ID/runs

### Métricas
- Tempo de execução
- Páginas processadas
- Taxa de sucesso
- Custos (compute units)

### Logs
- Debug logs disponíveis em cada run
- Configure `debugLog: true` no input para mais detalhes

## 🎉 Pronto!

Seu actor está configurado e pronto para uso!

### Recursos Úteis
- 📖 Documentação Apify: https://docs.apify.com
- 🐙 GitHub Docs: https://docs.github.com
- 🎭 Playwright Docs: https://playwright.dev
- 💬 Apify Discord: https://discord.com/invite/jyEM2PRvMU

---

**Dúvidas?** Abra uma issue no GitHub!
