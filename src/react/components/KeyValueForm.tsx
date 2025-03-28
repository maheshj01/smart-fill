import React, { useState, useEffect } from 'react';
import './KeyValueForm.css';

const KeyValueForm = () => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [data, setData] = useState(() => {
        // Load saved data from localStorage on initial render
        const savedData = JSON.parse(localStorage.getItem('keyValuePairs') || '[]');
        return savedData || [];
    });

    useEffect(() => {
        // Store data in localStorage whenever it changes
        localStorage.setItem('keyValuePairs', JSON.stringify(data));
    }, [data]);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (key && value) {
            setData((prevData: any) => [...prevData, { key, value }]);
            setKey('');
            setValue('');
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Key-Value Pair Form</h2>

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="key" className="form-label">Key</label>
                    <input
                        type="text"
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="form-input"
                        placeholder="Enter key"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="value" className="form-label">Value</label>
                    <input
                        type="text"
                        id="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="form-input"
                        placeholder="Enter value"
                    />
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                >
                    Save
                </button>
            </form>

            <div className="saved-data">
                <h3 className="saved-title">Saved Key-Value Pairs</h3>
                <ul className="saved-list">
                    {data.map((item: any, index: any) => (
                        <li key={index} className="saved-item">
                            <span className="key">{item.key}:</span>
                            <span className="value">{item.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default KeyValueForm;
