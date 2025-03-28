// background.ts (Optional for managing state like tokens)
chrome.runtime.onInstalled.addListener(() => {
    console.log('AutoFill Extension installed!');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message received', message);
    if (message === 'get_token') {
        chrome.storage.local.get(['token'], (result) => {
            console.log('Value currently is ', result.token);
            sendResponse(result.token);
        });
    }
    else if (message.type === 'set_token') {
        chrome.storage.local.set({ token: message.token }, () => {
            console.log('Value is set to ', message.token);
        });
    } else if (message.action === 'getResumeData') {
        // Retrieve the resume data from chrome.storage.local
        chrome.storage.local.get('userResume', (result) => {
            if (result.userResume) {
                sendResponse({ data: result.userResume });
            } else {
                sendResponse({ data: null });
            }
        });
        return true;  // Required to send a response asynchronously
    } else if (message.action === 'get_api_key') {
        chrome.storage.local.get(['api_key'], (result) => {
            if (result.api_key) {
                console.log('API Key found:', result.api_key);
                sendResponse({ api_key: result.api_key })
            } else {
                sendResponse({ api_key: "" });
                console.log('sending harcoded api key');
            }
        });
    }
    return true;
});
