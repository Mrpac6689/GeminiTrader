document.addEventListener('DOMContentLoaded', async () => {
  const captureBtn = document.getElementById('captureBtn');
  const warningMessage = document.getElementById('warningMessage');
  const urlWarningMessage = document.getElementById('warning-message');
  const responseArea = document.getElementById('responseArea');
  const responseContent = document.getElementById('responseContent');
  const loadingIndicator = document.getElementById('loading');

  // Function to show the analysis result
  function showAnalysisResult(result) {
    loadingIndicator.style.display = 'none';
    responseArea.style.display = 'block';
    responseContent.textContent = result;
    captureBtn.disabled = false;
  }

  // Function to show error
  function showError(error) {
    loadingIndicator.style.display = 'none';
    responseArea.style.display = 'block';
    responseContent.textContent = `Error: ${error}`;
    responseContent.style.color = 'red';
    captureBtn.disabled = false;
  }

  // Listen for analysis results from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'ANALYSIS_RESULT') {
      showAnalysisResult(message.result);
    } else if (message.type === 'ANALYSIS_ERROR') {
      showError(message.error);
    } else if (message.type === 'URL_CHECK') {
      urlWarningMessage.style.display = message.isAllowed ? 'none' : 'block';
      captureBtn.disabled = !message.isAllowed;
    }
  });

  // Check if current URL is tradingview.com
 /* chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    const isAllowed = currentUrl.match(/^https?:\/\/([^\/]+\.)?tradingview\.com/i) !== null;
    
    if (!isAllowed) {
      urlWarningMessage.style.display = 'block';
      captureBtn.disabled = true;
    }
  });
  */

  // Function to check settings and update UI
  async function checkSettingsAndUpdateUI() {
    try {
      const settings = await chrome.storage.sync.get(['webhookUrl']);
      const isConfigured = settings.webhookUrl && settings.webhookUrl.trim() !== '';

      if (captureBtn.disabled !== true) { // Only update if not already disabled by URL check
        captureBtn.disabled = !isConfigured;
      }
      warningMessage.style.display = isConfigured ? 'none' : 'block';
      warningMessage.textContent = 'Configure o URL do Webhook antes de fazer capturas';
      
      return isConfigured;
    } catch (error) {
      console.error('Erro encontrado:', error);
      captureBtn.disabled = true;
      warningMessage.style.display = 'block';
      return false;
    }
  }

  // Initial check
  await checkSettingsAndUpdateUI();

  // Handle screenshot button click
  captureBtn.addEventListener('click', async () => {
    try {
      // Clear previous results
      responseArea.style.display = 'none';
      responseContent.textContent = '';
      
      // Show loading indicator
      loadingIndicator.style.display = 'block';
      
      // Disable button while processing
      captureBtn.disabled = true;
      
      // Verify settings again before proceeding
      const isConfigured = await checkSettingsAndUpdateUI();
      if (!isConfigured) {
        showError('Configure a URL do Webhook primeiro');
        return;
      }

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showError('Nenhuma aba ativa para captura');
        return;
      }

      // Send message to background script to take screenshot
      chrome.runtime.sendMessage({ 
        action: 'takeScreenshot', 
        tabId: tab.id 
      }, (response) => {
        if (chrome.runtime.lastError) {
          showError('Falha ao tirar o screenshot');
        } else if (response && response.success) {
          showAnalysisResult(response.response);
        } else if (response && response.error) {
          showError(response.error);
        }
      });
      
    } catch (error) {
      showError(error.message || 'Falha ao capturar a Screenshot');
    }
  });
}); 