##### Smart Fill

A chrome extension that fills out forms for you using Gemini's API. Provide a context to the extension and it will fill out the form for you.

### How it works

1. User provides a context to the extension
2. Extension fetches the data from Gemini's API ahd stores it in the form of a JSON object
3. User focuses on the input field, a gemini icon appears on the input field
4. User clicks on the icon, the extension fills out the form for the user
5. If you need a custom answer just fill in the input as a prompt and click on the gemini icon

content.ts - This file is responsible for the content script that runs on the page. It listens for the user to click on the gemini icon and then fills out the form for the user.

background.ts - This file is responsible for the background script that runs in the background. It listens for the user to provide a context and then fetches the data from Gemini's API and stores it in the form of a JSON object.

