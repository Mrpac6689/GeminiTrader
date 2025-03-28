document.addEventListener('DOMContentLoaded', async () => {
  // Default settings
  const defaultSettings = {
    webhookUrl: 'https://yourn8nwebhook.com'
  };

  // Load saved settings with defaults
  const settings = await chrome.storage.sync.get({
    webhookUrl: defaultSettings.webhookUrl
  });

  // Populate form field
  document.getElementById('webhookUrl').value = settings.webhookUrl;
});

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('status');
  
  const settings = {
    webhookUrl: document.getElementById('webhookUrl').value.trim().replace(/\/$/, '') // Remove trailing slash if present
  };

  try {
    await chrome.storage.sync.set(settings);
    status.textContent = 'Configs. salvas com sucesso!';
    status.className = 'status success';

    // Send message to popup to refresh its state
    chrome.runtime.sendMessage({ action: 'settingsUpdated' });
  } catch (error) {
    status.textContent = 'Erro ao salvar configurações: ' + error.message;
    status.className = 'status error';
  }
  
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}); 