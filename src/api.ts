// api.ts
export async function fetchAutoFillData(): Promise<string> {
    const response = await fetch('https://api.example.com/autofill');
    const result = await response.json();
    return result.suggestion || '';
}