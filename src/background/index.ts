import Constants from "../react/components/Constants";

// background.ts (Optional for managing state like tokens)
chrome.runtime.onInstalled.addListener(() => {
    console.log('AutoFill Extension installed!');
});

async function fetchData(methodKey: string): Promise<any> {
    return new Promise((resolve) => {
        chrome.storage.local.get([methodKey], (result) => {
            resolve(result[methodKey] ?? null);
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    (async () => {
        try {
            let responseData = null;

            switch (message.action) {
                case Constants.getResumeData:
                    responseData = await fetchData(Constants.resumeKey);
                    break;
                case Constants.getApiKey:
                    responseData = await fetchData(Constants.geminiKey);
                    break;
                case Constants.getMappedResumeData:
                    responseData = await fetchData(Constants.mappedResumeKey);
                    break;
                default:
                    console.warn('Unknown action:', message.action);
            }

            sendResponse(responseData ? { data: responseData } : { error: 'No data found' });
        } catch (error: any) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.toString() });
        }
    })();

    return true; // Required for async sendResponse
});
