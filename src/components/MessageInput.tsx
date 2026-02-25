"use client";
import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import './MessageInput.css';

interface MessageInputProps {
    onSubmit: (prompt: string) => void;
}

export function MessageInput({ onSubmit }: MessageInputProps) {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(value);
            setValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <button type="button" className="add-btn">
                <Plus size={20} className="add-icon" />
            </button>
            <input
                type="text"
                className="message-input"
                placeholder="제품에 대해 질문해 보세요..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button type="submit" className="send-btn" disabled={!value.trim()}>
                <Send size={20} className={value.trim() ? "send-icon active" : "send-icon"} fill={value.trim() ? "currentColor" : "none"} />
            </button>
        </form>
    );
}
