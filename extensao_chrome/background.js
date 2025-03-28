// Initialize the service worker
self.addEventListener('install', (event) => {
  console.log('Instalando servidor de serviço...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SAtivando servidor de serviço...');
});

// Initialize screenshot counter
let screenshotCounter = 0;

// Function to verify webhook settings
async function verifySettings() {
  console.log('Verificando configurações do webhook...');
  const settings = await chrome.storage.sync.get(['webhookUrl']);

  if (!settings.webhookUrl) {
    throw new Error('Rota URL do Webhook não configurada');
  }

  return settings;
}

// Function to convert base64 to binary blob
function base64ToBlob(base64Data) {
  // Remove the data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
  // Convert base64 to binary
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: 'image/png' });
}

// Function to show notification
function showNotification(title, message, isError = false) {
  console.log('Mostrando notificações:', { title, message, isError });
  
  const notificationOptions = {
    type: 'basic',
    title: title,
    message: message,
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };

  try {
    chrome.notifications.create(String(Date.now()), notificationOptions, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Erro notificado:', chrome.runtime.lastError);
      } else {
        console.log('Notificação criada:', notificationId);
      }
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

// Screenshot handler
async function handleScreenshot(tabId, sendResponse) {
  console.log('Iniciando captura da aba:', tabId);
  
  try {
    // Verify settings first
    const settings = await verifySettings();
    console.log('Configurações do Webhook confirmadas');

    // Take screenshot
    console.log('Capturando screenshot...');
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    console.log('Screenshot capturada');

    // Convert base64 to binary blob
    const binaryData = base64ToBlob(screenshot);
    console.log('Convertendo para dados binarios');

    // Upload screenshot
    console.log('Iniciando envio ao to webhook...');
    const response = await fetch(settings.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
      },
      body: binaryData
    });

    // Get response text
    const responseText = await response.text();
    console.log('Resposta recebida:', responseText);

    if (!response.ok) {
      throw new Error(`Falha no envio: ${response.status} ${response.statusText}`);
    }

    console.log('Envio bem sucedido');

    // Save to history
    console.log('Atualizando historico de capturas...');
    const result = await chrome.storage.local.get('screenshots');
    const screenshots = result.screenshots || [];
    
    screenshots.push({
      id: screenshotCounter,
      timestamp: new Date().toISOString()
    });

    await chrome.storage.local.set({ screenshots: screenshots });
    console.log('Historico de capturas atualizado');

    // Show success notification
    showNotification(
      'Analise Completa',
      'Verifique o pop-up para ver os resultados'
    );

    // Try to send the response to any open popups
    try {
      chrome.runtime.sendMessage({
        type: 'ANALYSIS_RESULT',
        result: responseText
      }).catch(() => {
        console.log('Popup indisponivel para receber a resposta');
      });
    } catch (error) {
      console.log('Erro ao enviar resultado ao popup:', error);
    }

    // Send response back to popup
    if (sendResponse) {
      sendResponse({
        success: true,
        response: responseText
      });
    }

  } catch (error) {
    console.error('Erro no tratamento da captura:', error);
    showNotification(
      'Screenshot Error',
      error.message,
      true
    );

    // Try to send the error to any open popups
    try {
      chrome.runtime.sendMessage({
        type: 'ANALYSIS_ERROR',
        error: error.message
      }).catch(() => {
        console.log('Nenhum popup para receber o erro');
      });
    } catch (error) {
      console.log('Erro enviado ao popup:', error);
    }

    // Send error back to popup
    if (sendResponse) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensagem enviada:', request);
  
  if (request.action === 'takeScreenshot') {
    if (!request.tabId) {
      console.error('Nenhuma ID de aba fornecida');
      sendResponse({
        success: false,
        error: 'Nenhuma ID de aba fornecida'
      });
      return false;
    }
    
    // Handle screenshot and send response
    handleScreenshot(request.tabId, sendResponse);
    return true; // Will respond asynchronously
  }
  
  return false;
});

// Modify the existing chrome.tabs.onActivated listener or add it if it doesn't exist
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isAllowed = isAllowedUrl(tab.url);
    
    // Send message only to active popup if it exists
    chrome.runtime.sendMessage({ type: 'URL_CHECK', isAllowed }).catch(() => {
      // Ignore errors when popup is not open
      console.log('Popup indisponivel, mensagem não enviada');
    });
  } catch (error) {
    console.error('Erro no serviço onActivated:', error);
  }
});

// Also listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const isAllowed = isAllowedUrl(changeInfo.url);
    
    // Send message only to active popup if it exists
    chrome.runtime.sendMessage({ type: 'URL_CHECK', isAllowed }).catch(() => {
      // Ignore errors when popup is not open
      console.log('Popup indisponivel, mensagem não enviada');
    });
  }
}); 