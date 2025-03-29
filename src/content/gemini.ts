import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "../react/components/Constants";

class Gemini {
    apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    async fetchData(method_key: string): Promise<any> {
        chrome.runtime.sendMessage({ action: method_key }, (response) => {
            if (response && response.data) {
                return response.data;
            } else {
                console.log('No resume data found');
                return '';
            }
        });
        return '';
    }


    async generateContent(prompt: String): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt as string);
            const textResponse = await result.response;
            return textResponse.text();
        } catch (error) {
            console.error('Error querying Gemini:', error);
            return `An error occurred while fetching the response. ${error}`;
        }
    }

    async fetchAutoFillData(context: object, currentValue?: string): Promise<string> {
        try {
            console.log('Fetching autofill data:', context, "api key=", this.apiKey);
            const resumeMap = await this.fetchData(Constants.getMappedResumeData);
            console.log('resumeMap:', resumeMap);
            const contextObj = context as any;
            const label = contextObj.label?.toLowerCase() || '';
            const name = contextObj.name?.toLowerCase() || '';

            // Try finding a match in the resumeData first
            for (const key of Object.keys(resumeMap)) {
                if (label.includes(key) || name.includes(key)) {
                    return resumeMap[key as string];
                }
            }

            // If no match is found, try extracting a value from resumeData
            const matchedData = resumeMap[label] || resumeMap[name];
            if (matchedData) return matchedData;

            // If no relevant data is found, generate content using Gemini API
            const resumeDataContext = await this.fetchData(Constants.getResumeData);
            const prompt = currentValue && currentValue.length > 0
                ? currentValue
                : `
                    Given this resume context:
                    ${JSON.stringify(resumeDataContext, null, 2)}
    
                    Extract the most relevant value for the input field labeled as: "${label}".
                    - Ensure the response is concise and formatted correctly.
                    - If no clear value is found, provide the closest possible match from the resume.
                    - Do not generate fictional data, only extract from the resume.
                `;

            return await this.generateContent(prompt);
        } catch (error) {
            console.error('Error fetching data:', error);
            return 'Error occurred';
        }
    }
}

export default Gemini;