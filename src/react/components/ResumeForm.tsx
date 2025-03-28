import React, { useEffect, useState } from 'react';
import './ResumeForm.css'; // Importing the custom CSS file
import Constants from './Constants';

const ResumeForm = () => {
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load saved resume when the component mounts
    useEffect(() => {
        chrome.storage.local.get([Constants.resumeKey], (result) => {
            if (result[Constants.resumeKey]) {
                setResumeText(result[Constants.resumeKey].text);
            }
        });
    }, []); // // Empty dependency array to run only once on mount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!resumeText) {
                throw new Error('Resume cannot be empty');
            }

            // Simulating saving data to localStorage
            const parsedResume = {
                text: resumeText,
                parsedAt: new Date().toISOString(),
            };

            chrome.storage.local.set({ [Constants.resumeKey]: parsedResume }, () => {
                setSuccess(true);
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-form-container">
            <h2 className="form-title">Paste Y  our Resume</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="resume" className="form-label">Your Resume Text</label>
                    <textarea
                        id="resume"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        maxLength={5000}
                        className="form-textarea"
                        placeholder="Enter your resume here..."
                    />
                </div>

                {error && (
                    <div className="form-error">{error}</div>
                )}

                <button
                    type="submit"
                    className={`form-submit-button ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Resume'}
                </button>
            </form>

            {success && (
                <div className="form-success">
                    Resume saved successfully!
                </div>
            )}
        </div>
    );
};

export default ResumeForm;
