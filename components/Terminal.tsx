
import React, { useState, useEffect, useRef } from 'react';
import { type HistoryEntry, Author } from '../types';

interface TerminalProps {
  history: HistoryEntry[];
  isLoading: boolean;
  onSubmit: (command: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ history, isLoading, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(inputValue);
    setInputValue('');
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderLine = (entry: HistoryEntry, index: number) => {
    const prefix = entry.author === Author.USER ? '> ' : '';
    const textClasses = entry.author === Author.SYSTEM ? 'text-yellow-400' : 'text-green-400';

    return (
      <div key={index} className="whitespace-pre-wrap break-words">
        <span className={textClasses}>{prefix}{entry.text}</span>
      </div>
    );
  };

  return (
    <div 
      className="flex-grow flex flex-col border-2 border-green-700 bg-black bg-opacity-75 p-4 overflow-hidden" 
      onClick={handleClick}
    >
      <div className="flex-grow overflow-y-auto pr-2">
        {history.map(renderLine)}
        {isLoading && (
          <div className="flex items-center">
            <span className="text-green-400">PROCESSING...</span>
            <div className="w-4 h-4 ml-2 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex items-center mt-2">
        <span className="text-green-400 mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-transparent text-green-400 font-mono w-full focus:outline-none"
          disabled={isLoading}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </form>
    </div>
  );
};

export default Terminal;
