"use client";
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PrePromptView } from './components/PrePromptView';
import { PostPromptView } from './components/PostPromptView';
import './app/globals.css';

function App() {
  const [isPromptSubmitted, setIsPromptSubmitted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const handlePromptSubmit = (prompt: string) => {
    if (prompt.trim()) {
      setCurrentPrompt(prompt);
      setIsPromptSubmitted(true);
    }
  };

  return (
    <>
      <Sidebar isSidebarClosed={isPromptSubmitted} onNewChat={() => setIsPromptSubmitted(false)} />
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100vh',
        transition: 'width 0.3s ease',
        backgroundColor: 'var(--bg-color)',
        overflow: 'hidden'
      }}>
        {isPromptSubmitted ? (
          <PostPromptView onSubmit={handlePromptSubmit} initialPrompt={currentPrompt} />
        ) : (
          <PrePromptView onSubmit={handlePromptSubmit} />
        )}
      </main>
    </>
  );
}

export default App;
