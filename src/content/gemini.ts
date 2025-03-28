import { GoogleGenerativeAI } from "@google/generative-ai";

class Gemini {
    apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    async fetchResumeData(): Promise<string> {
        chrome.runtime.sendMessage({ action: 'getResumeData' }, (response) => {
            if (response && response.data) {
                // Inject the data into the webpage or do whatever is needed with it
                console.log('Resume data found:', response.data);
                return response.data;
            } else {
                console.log('No resume data found');
                return '';
            }
        });
        return "";
    }


    async generateContent(prompt: String): Promise<string> {
        try {
            const resumeData = await this.fetchResumeData();
            console.log('resumeData:', resumeData); // Debug logging
            console.log('Generating content for prompt:', prompt); // Debug logging
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

    async fetchAutoFillData(context: object): Promise<string> {
        try {
            const resumeData = await this.fetchResumeData();
            // For now, return a sample response based on the context
            // In a real implementation, you would make an API call here
            await new Promise(resolve => setTimeout(resolve, 1000));

            const contextObj = context as any;
            const label = contextObj.label || '';
            // Generate different responses based on detected label/context
            if (label.toLowerCase().includes('email') || contextObj.name.toLowerCase().includes('email')) {
                return 'user@example.com';
            } else if (label.toLowerCase().includes('name') || contextObj.name.toLowerCase().includes('name')) {
                if (label.toLowerCase().includes('first')) {
                    return 'John';
                } else if (label.toLowerCase().includes('last')) {
                    return 'Doe';
                } else {
                    return 'John Doe';
                }
            } else if (label.toLowerCase().includes('phone') || contextObj.name.toLowerCase().includes('phone')) {
                return '555-123-4567';
            } else if (label.toLowerCase().includes('address') || contextObj.name.toLowerCase().includes('address')) {
                return '123 Main St, Anytown, USA';
            } else {
                const prompt =
                    `This is my resume ${resumeData}. Help me autofill the following information: ${label}`;
                return this.generateContent(prompt);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return 'Error occurred';
        }
    }
}

export default Gemini;