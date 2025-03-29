import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "../react/Constants";

class Gemini {
    apiKey: string;
    resumeMap: Record<string, string>; // Ensures proper indexing
    resumeData: Record<string, any>;

    constructor(apiKey: string, resumeMap: Record<string, string> = {}, resumeData: Record<string, any> = {}) {
        this.apiKey = apiKey;
        this.resumeMap = resumeMap;
        this.resumeData = resumeData;
    }
    async generateContent(prompt: String): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt as string);
            const textResponse = await result.response;
            return textResponse.text();
        } catch (error) {
            return `An error occurred while fetching the response. ${error}`;
        }
    }

    async fetchAutoFillData(context: Record<string, any>, currentValue?: string): Promise<string> {
        try {
            console.log('Fetching autofill data:', context, "api key=", this.apiKey);
            const contextObj = context as any;
            const label = contextObj.label?.toLowerCase() || '';
            const name = contextObj.name?.toLowerCase() || '';

            // 1. Try finding a match in resumeMap
            for (const key of Object.keys(this.resumeMap)) {
                if (label.includes(key) || name.includes(key)) {
                    return this.resumeMap[key];
                }
            }
            // // If no match is found, try extracting a value from resumeData
            const matchedData = this.resumeMap[label] || this.resumeMap[name];
            if (matchedData) return matchedData;

            // // If no relevant data is found, generate content using Gemini API
            // await this.fetchData(Constants.getResumeData);
            const prompt = currentValue && currentValue.length > 0
                ? currentValue
                : `
                    Given this resume context:
                    ${JSON.stringify(this.resumeData, null, 2)}
    
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