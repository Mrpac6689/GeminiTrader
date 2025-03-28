# Gemini Trader IA - Versão 2.0

> Uma solução integrada de análise autônoma de mercado via IA, utilizando Webhook com n8n e extensão para Chrome.

---

## 🤖 Visão Geral
O **Gemini Trader IA** é uma ferramenta que permite capturar imagens de gráficos diretamente do navegador e enviá-las para um modelo de linguagem com visão computacional (Google Gemini) via n8n, retornando uma análise objetiva de mercado.

A solução foi projetada para traders e analistas que desejam:
- Automatizar recomendações (COMPRA, VENDA, NEUTRO)
- Incorporar IA no trading
- Integrar facilmente com outras ferramentas via Webhook/API

---

## 🌐 Componentes da Solução

### 1. **Extensão para Google Chrome**

#### Funcionalidades:
- Captura de tela da aba ativa
- Envio da imagem para um webhook configurado
- Interface responsiva, amigável e em português
- Retorno da resposta da IA diretamente no popup
- Armazenamento do histórico local (futuramente integrável com n8n)

#### Tecnologias:
- HTML/CSS/JS Puro (sem frameworks)
- Chrome Extensions (Manifest V3)
- Service Worker (background.js)
- Workflow json n8n

#### Instalação:
1. Acesse `chrome://extensions/`
2. Ative o **modo desenvolvedor**
3. Clique em **"Carregar sem compactação"** e selecione a pasta do projeto

---

### 2. **Workflow no n8n**

#### Arquitetura:
- **Webhook HTTP** para receber imagem `POST` (Content-Type: image/png)
- **Nó Set** define ID de sessão
- **Simple Memory** com contexto de 5 mensagens
- **Google Gemini Chat Model** integrado via LangChain
- **AI Agent** para interpretar e responder
- **Respond to Webhook** envia a resposta

#### Prompt Utilizado:
> "Analise o mercado de acordo com a imagem. Responda em pt-br numa frase única, com no máximo 50 caracteres, fazendo uma recomendação para COMPRA, VENDA ou NEUTRO, incluindo o percentual de confiabilidade. Caso a resposta seja de COMPRA ou VENDA, inclua também os alvos de takeprofit ou stoploss."

#### Requisitos:
- Conta Google API ativada com acesso ao Gemini
- API Key configurada no `googlePalmApi`
- n8n rodando localmente ou via VPS (com HTTPS e acesso externo ao Webhook)

> **Aviso legal**: "Gemini" é uma tecnologia desenvolvida pelo Google. O autor deste projeto **não possui qualquer vínculo ou afiliação com o Google ou suas subsidiárias**. O uso da API do Gemini está sujeito aos **termos de uso e políticas do Google**, que devem ser lidos e aceitos separadamente.

---

## 🔧 Recursos e Funcionalidades

### ✅ Atuais:
- Captura de tela do gráfico com um clique
- Análise instantânea via IA
- Recomendacão de compra, venda ou neutro com confiabilidade
- Definição de take profit e stop loss automáticos (quando aplicável)
- Interface responsiva (popup e configurações)

### ⏳ Em desenvolvimento:
- Logs de histórico da extensão integrados ao n8n
- Envio de push notification via Telegram/Discord
- Execução de ordens automatizadas via corretora/Exchange (MT5, Binance etc)
- Painel Web com dashboard (via Node-RED ou n8n UI)

---

## 👁️ Licenciamento
Este projeto é mantido por Michel Paes como parte de uma arquitetura experimental de trading autônomo com IA.
Distribuição privada autorizada para uso pessoal e fins educacionais.

---

## 🚀 Começando Rápido
1. Instale a extensão e configure a URL do Webhook no menu "Configurações"
2. Instale o workflow no seu n8n (via JSON import)
3. Clique em "Analisar Tela" com um gráfico visível
4. Veja a resposta aparecer no popup com a recomendação

---

## 🚧 Estrutura de Arquivos

```
GeminiTraderIA/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── settings.html
├── settings.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
├── logo.png
├── workflow/
│   └── Analise_Mercado_Gemini.json
```

---

## 🚀 Exemplo de Resposta da IA:
```txt
VENDA com 84% | TP: 126.700 | SL: 132.850
```

---

## 🛌 Contato
- Desenvolvido por Michel Ribeiro Paes
- Email: [michel@michelpaes.com.br]
- Site: [https://server.michelpaes.com.br]

---

Bons trades e que a Força esteja com você! ✨
