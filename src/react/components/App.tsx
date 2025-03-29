import React, { useState, useEffect } from 'react';
import "./App.css";
import Constants from '../Constants';
import Gemini from '../../content/gemini';

const PromptForm: React.FC = () => {
  const [context, setContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const gemini = new Gemini(apiKey);

  // Load saved resume and API key on mount
  useEffect(() => {
    chrome.storage.local.get([Constants.resumeKey, Constants.geminiKey], (result) => {
      if (result[Constants.resumeKey]) setContext(result[Constants.resumeKey].text);
      if (result[Constants.geminiKey]) setApiKey(result[Constants.geminiKey]);
    });
  }, []);

  // Generate mapped data using Gemini API
  const generateMappedData = async (): Promise<string> => {
    try {
      const prompt = `
        Given the following context:
  
        ${context}
  
        Extract relevant information and generate a **valid JSON response** that strictly adheres to the following schema:
  
        ${Constants.resumeSchema}
  
        Ensure:
        - The output is properly formatted JSON.
        - All required fields are present.
        - Use appropriate data types as defined in the schema.
        - If a field is missing from the context, exclude it from the output instead of providing null or empty values.
      `;

      return await gemini.generateContent(prompt);
    } catch (error) {
      console.error('Error querying Gemini:', error);
      return `An error occurred while fetching the response. ${error}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!context) return setError('Resume cannot be empty');
    if (!apiKey) return setError('API key cannot be empty');

    try {
      const parsedResume = {
        text: context,
        parsedAt: new Date().toISOString(),
      };

      const resumeData = await generateMappedData();
      chrome.storage.local.set(
        {
          [Constants.resumeKey]: parsedResume,
          [Constants.geminiKey]: apiKey,
          [Constants.mappedResumeKey]: resumeData,
        },
        () => setSuccess(true)
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-form-container">
      <h2 className="form-title">Paste Your Resume</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resume" className="form-label">Your Resume here</label>
          <textarea
            id="resume"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            maxLength={5000}
            className="form-textarea"
            placeholder="Enter your resume here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey" className="form-label">API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="form-input"
            placeholder="Enter your API key..."
          />
        </div>
        {/* Link to get API key */}
        <a
          style={{ margin: '10px 0', marginBottom: '20px', display: 'block', color: '#0077cc', textDecoration: 'none' }}
          href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noreferrer">
          Get your API key
        </a>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className={`form-submit-button ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      {success && <div className="form-success">Data saved successfully!</div>}
    </div>
  );
};

export default PromptForm;
