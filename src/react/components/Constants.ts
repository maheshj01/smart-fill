class Constants {
    public static readonly resumeKey = "userResume";
    public static readonly geminiKey = "gemini_key"
    public static readonly mappedResumeKey = "mappedResumeData";

    // keys for injected components
    public static readonly autoFillIconId = "autofill-icon";

    //   keys for communication between content and background scripts
    public static readonly getApiKey = "get_api_key";
    public static readonly getResumeData = "get_resume_data";
    public static readonly getUserContext = "get_user_context";
    public static readonly getMappedResumeData = "get_mapped_resume_data";
    public static readonly backgroundMessage = "background_channel";

    // schema for the resume data
    public static readonly resumeSchema =
        `{
            "title": "Resume Data",
            "type": "object",
            "properties": {
              "name": { "type": "string", "description": "Full name of the candidate" },
              "email": { "type": "string", "format": "email", "description": "Candidate's email address" },
              "phone": { "type": "string", "description": "Candidate's phone number" },
              "summary": { "type": "string", "description": "Brief professional summary" },
              "education": {
                "type": "array",
                "description": "List of educational qualifications",
                "items": {
                  "type": "object",
                  "properties": {
                    "institution": { "type": "string", "description": "University/College name" },
                    "degree": { "type": "string", "description": "Degree obtained" },
                    "field_of_study": { "type": "string", "description": "Field of study/major" },
                    "start_year": { "type": "integer", "description": "Start year of the program" },
                    "end_year": { "type": "integer", "description": "Graduation year (or expected)" }
                  }
                }
              },
              "experience": {
                "type": "array",
                "description": "List of past jobs",
                "items": {
                  "type": "object",
                  "properties": {
                    "company": { "type": "string", "description": "Company name" },
                    "position": { "type": "string", "description": "Job title" },
                    "start_date": { "type": "string", "format": "date", "description": "Start date (YYYY-MM-DD)" },
                    "end_date": { "type": "string", "format": "date", "description": "End date (or 'Present')" },
                    "description": { "type": "string", "description": "Job responsibilities and achievements" }
                  }
                }
              },
              "skills": {
                "type": "array",
                "description": "List of technical and soft skills",
                "items": { "type": "string" }
              },
              "projects": {
                "type": "array",
                "description": "List of significant projects",
                "items": {
                  "type": "object",
                  "properties": {
                    "title": { "type": "string", "description": "Project name" },
                    "description": { "type": "string", "description": "Brief project overview" },
                    "technologies": {
                      "type": "array",
                      "description": "Technologies used",
                      "items": { "type": "string" }
                    }
                  }
                }
              },
              "certifications": {
                "type": "array",
                "description": "List of certifications",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": { "type": "string", "description": "Certification name" },
                    "issued_by": { "type": "string", "description": "Issuing organization" },
                    "year": { "type": "integer", "description": "Year of certification" }
                  }
                }
              },
              "languages": {
                "type": "array",
                "description": "List of languages spoken",
                "items": { "type": "string" }
              }
            },
            "required": ["name", "email", "phone", "experience", "education"]
          }`
}

export default Constants;