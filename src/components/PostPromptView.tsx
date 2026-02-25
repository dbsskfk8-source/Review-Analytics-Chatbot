"use client";
import { Star, Plus, ThumbsUp, ThumbsDown, ArrowRight, Quote, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import './PostPromptView.css';

interface PostPromptViewProps {
    onSubmit: (prompt: string) => void;
    initialPrompt?: string;
}

export function PostPromptView({ onSubmit, initialPrompt }: PostPromptViewProps) {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [results, setResults] = useState<any[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialPrompt) {
            handleSearch(initialPrompt);
        }
    }, [initialPrompt]);

    const handleSearch = async (query: string) => {
        setPrompt(query);
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query }),
            });
            const data = await res.json();
            if (data.results) {
                setResults(data.results);
            }
            if (data.answer) {
                setAnswer(data.answer);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        window.location.reload();
    };

    return (
        <div className="post-prompt-view">
            <header className="post-header">
                <div className="post-header-left">
                    <div className="reviewbot-icon-wrapper">
                        <Star size={16} fill="white" color="white" />
                    </div>
                    <span className="reviewbot-title">ReviewBot AI</span>
                </div>
                <div className="post-header-right">
                    <button className="new-chat-btn-header" onClick={handleNewChat}>
                        <Plus size={16} />
                        <span>새 채팅</span>
                    </button>
                    <div className="avatar header-avatar">JD</div>
                </div>
            </header>

            <div className="chat-container">
                <div className="date-pill">오늘</div>

                {/* User Message */}
                <div className="message-row user-row">
                    <div className="message-meta-right">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> <strong>나</strong>
                    </div>
                    <div className="message-content-wrapper user-wrapper">
                        <div className="message-bubble user-bubble">
                            {prompt}
                        </div>
                        <div className="avatar sm-avatar">JD</div>
                    </div>
                </div>

                {/* AI Message */}
                <div className="message-row ai-row">
                    <div className="message-meta-left">
                        <strong>ReviewBot</strong> <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="message-content-wrapper ai-wrapper">
                        <div className="ai-avatar-icon">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="10" x="3" y="11" rx="2" />
                                    <circle cx="12" cy="5" r="2" />
                                    <path d="M12 7v4" />
                                    <line x1="8" x2="8" y1="16" y2="16" />
                                    <line x1="16" x2="16" y1="16" y2="16" />
                                </svg>
                            )}
                        </div>
                        <div className="message-bubble ai-bubble">
                            {isLoading ? (
                                <p className="ai-text">리뷰를 분석 중입니다...</p>
                            ) : answer ? (
                                <div className="ai-response-container">
                                    <p className="ai-text">{answer}</p>
                                </div>
                            ) : results.length > 0 ? (
                                <>
                                    <p className="ai-text">
                                        가장 관련 있는 리뷰들을 바탕으로 분석한 결과입니다.
                                    </p>
                                    <ul className="ai-list">
                                        {results.slice(0, 3).map((r: any, idx: number) => (
                                            <li key={idx}><strong>{r.metadata.title}:</strong> {r.metadata.content.substring(0, 100)}...</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="ai-text">죄송합니다. 관련 리뷰를 찾지 못했습니다. "샘플 데이터 인덱싱"이 완료되었는지 확인해주세요.</p>
                            )}
                        </div>
                    </div>

                    {/* Referenced Reviews */}
                    {!isLoading && results.length > 0 && (
                        <div className="referenced-reviews-section">
                            <div className="referenced-header">
                                <Quote size={14} className="quote-icon" fill="currentColor" />
                                <span>참조된 리뷰</span>
                            </div>
                            <div className="reviews-grid">
                                {results.map((r: any, idx: number) => (
                                    <div className="review-card" key={idx}>
                                        <div className="review-card-header">
                                            <div className="reviewer-info">
                                                <div className={`reviewer-avatar ${idx % 2 === 0 ? 's-bg' : 'm-bg'}`}>
                                                    {String(r.metadata.author || 'RV').substring(0, 2)}
                                                </div>
                                                <div className="reviewer-meta">
                                                    <div className="reviewer-name">{r.metadata.author}</div>
                                                    <div className="review-source">추천도: {(r.score * 100).toFixed(0)}%</div>
                                                </div>
                                            </div>
                                            <div className="stars">
                                                {[...Array(r.metadata.rating || 5)].map((_, i) => (
                                                    <Star key={i} size={12} fill="#eab308" color="#eab308" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-content">
                                            "{r.metadata.content}"
                                        </p>
                                        <div className="review-actions">
                                            <button className="action-btn"><ThumbsUp size={14} /> {Math.floor(r.score * 100)}</button>
                                            <button className="action-btn"><ThumbsDown size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <div className="input-area-wrapper floating">
                <MessageInput onSubmit={handleSearch} />
                <div className="disclaimer">
                    ReviewBot은 실수를 할 수 있습니다. 참조된 리뷰를 확인해 주시기 바랍니다.
                </div>
            </div>
        </div>
    );
}
