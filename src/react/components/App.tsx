// src/PromptForm.tsx
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import "../styles/style.css";

const PromptForm: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Save API key to localStorage
  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = event.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('geminiApiKey', newApiKey);
  };

  // Handle prompt submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      alert('Please enter your API key.');
      return;
    }
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const textResponse = await result.response;
      setResponse(textResponse.text());
    } catch (error) {
      console.error('Error querying Gemini:', error);
      alert(`{An error occurred while fetching the response. ${error}}`);
    }
  };

  return (
    <div className="container">
      <h1>Gemini AI Prompt</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="api-key">API Key</label>
          <input
            type="text"
            id="api-key"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {response && (
        <div className="response">
          <h2>Response</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default PromptForm;
