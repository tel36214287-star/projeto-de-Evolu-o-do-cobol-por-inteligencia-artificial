import React, { useState, useCallback } from 'react';
import Terminal from './components/Terminal';
import { runCobolAi, runCobolProgram } from './services/geminiService';
import { type HistoryEntry, Author } from './types';

const initialHistory: HistoryEntry[] = [
  { author: Author.SYSTEM, text: 'COBOL ARTIFICIAL INTELLIGENCE ASSISTANT (C.A.I.A) v1.0' },
  { author: Author.SYSTEM, text: 'STATUS: READY. AWAITING INPUT.' },
];

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (command: string) => {
    const trimmedCommand = command.trim();
    if (trimmedCommand.length === 0) return;

    const userEntry: HistoryEntry = { author: Author.USER, text: trimmedCommand };
    setHistory(prev => [...prev, userEntry]);

    const upperCaseCommand = trimmedCommand.toUpperCase();

    // Handle client-side commands
    if (upperCaseCommand === 'CLEAR') {
      setHistory(initialHistory);
      return;
    }
    
    if (upperCaseCommand === 'HELP') {
      const helpText = `*** C.A.I.A. HELP UTILITY ***
SYSTEM COMMANDS:
  > HELP   - DISPLAYS THIS HELP INFORMATION.
  > CLEAR  - CLEARS THE TERMINAL DISPLAY.
  > STATUS - DISPLAYS CURRENT SYSTEM STATUS.
  > RUN    - EXECUTES THE LAST GENERATED COBOL PROGRAM.

QUERY AI ASSISTANT BY TYPING YOUR REQUEST.
EXAMPLE: "WRITE A HELLO WORLD PROGRAM IN COBOL."
END-OF-HELP.`;
      const helpEntry: HistoryEntry = { author: Author.SYSTEM, text: helpText };
      setHistory(prev => [...prev, helpEntry]);
      return;
    }

    if (upperCaseCommand === 'STATUS') {
      const statusText = `*** SYSTEM STATUS REPORT ***
SYSTEM: C.A.I.A V1.0
AI CORE: ONLINE - NOMINAL
CONNECTION: STABLE
MEMORY BANK: 98% FREE
STATUS: AWAITING USER INPUT.
END-OF-REPORT.`;
      const statusEntry: HistoryEntry = { author: Author.SYSTEM, text: statusText };
      setHistory(prev => [...prev, statusEntry]);
      return;
    }
    
    if (upperCaseCommand === 'RUN') {
      let lastCobolCode: string | null = null;
      for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        if (entry.author === Author.AI && entry.text.toUpperCase().includes('IDENTIFICATION DIVISION.')) {
          lastCobolCode = entry.text;
          break;
        }
      }

      if (lastCobolCode) {
        // Attempt to extract pure COBOL code, stripping the AI's persona wrappers
        const lines = lastCobolCode.split('\n');
        const startIdx = lines.findIndex(line => line.toUpperCase().includes('IDENTIFICATION DIVISION.'));
        // FIX: Replace findLastIndex with a backward loop for better compatibility.
        let endIdx = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].toUpperCase().trim() === 'END-OF-PROGRAM.') {
            endIdx = i;
            break;
          }
        }
        const codeToRun = lines.slice(startIdx, endIdx !== -1 ? endIdx : undefined).join('\n');

        if (codeToRun) {
            setIsLoading(true);
            setHistory(prev => [...prev, { author: Author.SYSTEM, text: 'EXECUTING PROGRAM...' }]);
            try {
              const output = await runCobolProgram(codeToRun);
              const formattedOutput = output.trim().length > 0 ? output : '[NO DISPLAY OUTPUT]';
              const outputEntry: HistoryEntry = { author: Author.SYSTEM, text: `*** PROGRAM OUTPUT ***\n${formattedOutput}\n*** END OF OUTPUT ***` };
              setHistory(prev => [...prev, outputEntry]);
            } catch (error) {
              const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
              const errorEntry: HistoryEntry = { author: Author.SYSTEM, text: `EXECUTION ERROR: ${errorText}` };
              setHistory(prev => [...prev, errorEntry]);
            } finally {
              setIsLoading(false);
            }
        } else {
             const noCodeEntry: HistoryEntry = { author: Author.SYSTEM, text: 'SYSTEM-WARNING: COULD NOT PARSE PROGRAM FROM LAST AI RESPONSE.' };
             setHistory(prev => [...prev, noCodeEntry]);
        }
      } else {
        const noCodeEntry: HistoryEntry = { author: Author.SYSTEM, text: 'SYSTEM-WARNING: NO COBOL PROGRAM FOUND IN BUFFER TO EXECUTE.' };
        setHistory(prev => [...prev, noCodeEntry]);
      }
      return;
    }

    // If not a client-side command, call AI
    setIsLoading(true);
    try {
      const aiResponse = await runCobolAi(trimmedCommand);
      const aiEntry: HistoryEntry = { author: Author.AI, text: aiResponse };
      setHistory(prev => [...prev, aiEntry]);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorEntry: HistoryEntry = { author: Author.SYSTEM, text: `ERROR: ${errorText}` };
      setHistory(prev => [...prev, errorEntry]);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  return (
    <div className="bg-black text-green-400 font-mono min-h-screen flex flex-col p-2 sm:p-4">
      <Terminal history={history} isLoading={isLoading} onSubmit={handleSubmit} />
    </div>
  );
};

export default App;