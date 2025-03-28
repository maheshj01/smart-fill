// src/PromptForm.tsx
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import "../styles/style.css";
import KeyValueForm from './KeyValueForm';
import ResumeForm from './ResumeForm';

const PromptForm: React.FC = () => {

  return (
    <div className="container">
      <ResumeForm />
    </div>
  );
};

export default PromptForm;
