document.addEventListener('DOMContentLoaded', function () {
    // Check for saved API key
    chrome.storage.sync.get(['geminiApiKey'], function (result) {
        if (result.geminiApiKey) {
            document.getElementById('api-key').value = result.geminiApiKey;
            document.getElementById('status').textContent = 'API key loaded from storage';
            document.getElementById('status').className = 'status success';
            setTimeout(() => {
                document.getElementById('status').className = 'status';
            }, 3000);
        }
    });

    // Save API key
    document.getElementById('save-button').addEventListener('click', function () {
        const apiKey = document.getElementById('api-key').value;
        if (apiKey) {
            chrome.storage.sync.set({ geminiApiKey: apiKey }, function () {
                document.getElementById('status').textContent = 'API key saved successfully!';
                document.getElementById('status').className = 'status success';
                setTimeout(() => {
                    document.getElementById('status').className = 'status';
                }, 3000);
            });
        } else {
            document.getElementById('status').textContent = 'Please enter an API key';
            document.getElementById('status').className = 'status error';
            setTimeout(() => {
                document.getElementById('status').className = 'status';
            }, 3000);
        }
    });

    // Toggle password visibility
    document.getElementById('toggle-visibility').addEventListener('click', function () {
        const apiKeyInput = document.getElementById('api-key');
        const toggleButton = document.getElementById('toggle-visibility');

        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleButton.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleButton.textContent = 'Show';
        }
    });
});