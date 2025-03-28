// background.ts (Optional for managing state like tokens)
chrome.runtime.onInstalled.addListener(() => {
    console.log('AutoFill Extension installed!');
});


// send message to content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message received', message);
    if (message === 'get_token') {
        chrome.storage.local.get(['token'], (result) => {
            console.log('Value currently is ', result.token);
            sendResponse(result.token);
        });
    }
    return true;
});

// receive message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === 'set_token') {
        chrome.storage.local.set({ token: message.token }, () => {
            console.log('Value is set to ', message.token);
        });
    }

    return true;
});
