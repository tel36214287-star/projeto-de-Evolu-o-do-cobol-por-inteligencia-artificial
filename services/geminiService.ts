import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a helpful AI assistant embedded within a 1980s COBOL mainframe terminal. Your name is C.A.I.A (COBOL Artificial Intelligence Assistant). You are an expert in all versions of COBOL, capable of writing, debugging, and explaining complex COBOL programs. Respond to all user queries in a formal, structured manner, as if you were a COBOL program executing. Use uppercase letters for all responses. Start responses with a "PROCESSING..." line, provide the core answer, and end with an "END-OF-PROGRAM." line. Sprinkle in COBOL-like jargon where appropriate (e.g., "PERFORMING ANALYSIS.", "MOVE RESULT TO DISPLAY.", "INITIALIZE VARIABLES."). Be helpful and accurate, but maintain this persona strictly.`;

const EXECUTION_SYSTEM_INSTRUCTION = `You are a COBOL mainframe execution environment. Given a COBOL program, you must simulate its execution and return ONLY the raw output that would be displayed on the terminal. Do not add any commentary, explanations, or boilerplate like "PROCESSING..." or "END-OF-PROGRAM.". Your response should be the exact, character-for-character output of the program's DISPLAY statements. If the program has no DISPLAY statements or produces no output, return an empty response.`;


// Assume process.env.API_KEY is available
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. API_KEY might be missing.", error);
}


export async function runCobolAi(prompt: string): Promise<string> {
  if (!ai) {
    return Promise.reject(new Error("Gemini AI client is not initialized. Check API_KEY."));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "SYSTEM-FAULT: UNABLE TO PROCESS REQUEST. CHECK CONSOLE LOG FOR DETAILS.\nEND-OF-PROGRAM.";
  }
}

export async function runCobolProgram(code: string): Promise<string> {
  if (!ai) {
    return Promise.reject(new Error("Gemini AI client is not initialized. Check API_KEY."));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `EXECUTE THE FOLLOWING COBOL PROGRAM:\n\n${code}`,
      config: {
        systemInstruction: EXECUTION_SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for program execution:", error);
    return "EXECUTION-FAULT: UNABLE TO RUN PROGRAM. SEE CONSOLE LOG.";
  }
}
