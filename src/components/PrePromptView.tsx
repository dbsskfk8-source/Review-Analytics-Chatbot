"use client";
import { Play, Dumbbell, Battery, AudioLines, ChevronDown, HelpCircle, Bell, Database, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { MessageInput } from './MessageInput';
import './PrePromptView.css';

interface PrePromptViewProps {
    onSubmit: (prompt: string) => void;
}

export function PrePromptView({ onSubmit }: PrePromptViewProps) {
    const [isIndexing, setIsIndexing] = useState(false);

    const handleIndexing = async () => {
        setIsIndexing(true);
        try {
            const res = await fetch('/api/ingest', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`${data.count}개의 리뷰 데이터 인덱싱이 완료되었습니다!`);
            } else {
                alert('인덱싱 실패: ' + data.error);
            }
        } catch (err) {
            alert('에러 발생: ' + err);
        } finally {
            setIsIndexing(false);
        }
    };

    return (
        <div className="pre-prompt-view">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <button
                        className="indexing-btn"
                        onClick={handleIndexing}
                        disabled={isIndexing}
                    >
                        {isIndexing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                        <span>{isIndexing ? '인덱싱 중...' : '샘플 데이터 인덱싱'}</span>
                    </button>
                    <div className="v-divider"></div>
                    <span className="analyzing-text">분석 중:</span>
                    <div className="dropdown">
                        <span>Sony WH-1000XM5</span>
                        <ChevronDown size={16} className="dropdown-icon" />
                    </div>
                </div>
                <div className="header-right">
                    <button className="icon-btn"><HelpCircle size={20} fill="currentColor" color="var(--text-muted)" className="icon-solid" /></button>
                    <button className="icon-btn"><Bell size={20} fill="currentColor" color="var(--text-muted)" className="icon-solid" /></button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="main-content">
                <div className="welcome-section">
                    <div className="robot-icon-wrapper">
                        <div className="robot-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="lucide-bot">
                                <rect width="18" height="10" x="3" y="11" rx="2" />
                                <circle cx="12" cy="5" r="2" />
                                <path d="M12 7v4" />
                                <line x1="8" x2="8" y1="16" y2="16" />
                                <line x1="16" x2="16" y1="16" y2="16" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="welcome-title">ReviewAI에 오신 것을 환영합니다</h1>
                    <p className="welcome-subtitle">
                        <strong>Sony WH-1000XM5</strong>에 대한 수천 개의 고객 리뷰를 분석했습니다.<br />
                        음질, 착용감, 배터리 수명 또는 특정 사용 목적에 대해 무엇이든 물어보세요.
                    </p>
                    <button className="auto-analysis-btn">
                        <Play size={16} fill="currentColor" color="var(--primary)" />
                        <span>자동 분석 시작</span>
                    </button>
                </div>

                {/* Suggested Questions */}
                <div className="suggested-section">
                    <h2 className="suggested-title">추천 질문</h2>
                    <div className="cards-container">
                        <div className="suggested-card" onClick={() => onSubmit('운동할 때 적합한가요?')}>
                            <div className="card-icon-wrapper blue-light">
                                <Dumbbell size={18} color="var(--primary)" />
                            </div>
                            <h3 className="card-title">운동할 때 적합한가요?</h3>
                            <p className="card-desc">운동 중 안정성과 내수성에 대해 물어보세요.</p>
                        </div>

                        <div className="suggested-card" onClick={() => onSubmit('실제 배터리 수명은?')}>
                            <div className="card-icon-wrapper blue-light">
                                <Battery size={18} color="var(--primary)" />
                            </div>
                            <h3 className="card-title">실제 배터리 수명은?</h3>
                            <p className="card-desc">ANC를 켰을 때 얼마나 지속되나요?</p>
                        </div>

                        <div className="suggested-card" onClick={() => onSubmit('노이즈 캔슬링은 어떤가요?')}>
                            <div className="card-icon-wrapper blue-light">
                                <AudioLines size={18} color="var(--primary)" />
                            </div>
                            <h3 className="card-title">노이즈 캔슬링은 어떤가요?</h3>
                            <p className="card-desc">비행기 엔진 소음에 얼마나 효과적인가요?</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="input-area-wrapper">
                <MessageInput onSubmit={onSubmit} />
                <div className="disclaimer">
                    ReviewAI는 실수를 할 수 있습니다. 중요한 정보는 확인해 주시기 바랍니다.
                </div>
            </div>
        </div>
    );
}
