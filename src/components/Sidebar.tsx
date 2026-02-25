"use client";
import { MessageSquare, History, Settings, Plus, Menu } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    isSidebarClosed: boolean;
    onNewChat: () => void;
}

export function Sidebar({ isSidebarClosed, onNewChat }: SidebarProps) {
    if (isSidebarClosed) return null;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">
                        <MessageSquare color="white" size={18} fill="currentColor" />
                    </div>
                    <span className="logo-text">ReviewAI</span>
                </div>
                <button className="collapse-btn">
                    <Menu size={20} />
                </button>
            </div>

            <div className="new-chat-container">
                <button className="new-chat-btn" onClick={onNewChat}>
                    <Plus size={18} />
                    <span>새 채팅</span>
                </button>
            </div>

            <div className="sidebar-section">
                <h3 className="section-title">최근 기록</h3>
                <ul className="history-list">
                    <li className="history-item active">
                        <MessageSquare size={16} className="item-icon" />
                        <span>Sony WH-1000XM5</span>
                    </li>
                    <li className="history-item">
                        <MessageSquare size={16} className="item-icon" />
                        <span>Bose QuietComfort 45</span>
                    </li>
                    <li className="history-item">
                        <MessageSquare size={16} className="item-icon" />
                        <span>AirPods Max</span>
                    </li>
                    <li className="history-item">
                        <MessageSquare size={16} className="item-icon" />
                        <span>Sennheiser Momentum 4</span>
                    </li>
                </ul>
            </div>

            <div className="sidebar-section">
                <h3 className="section-title">지난 7일</h3>
                <ul className="history-list">
                    <li className="history-item">
                        <History size={16} className="item-icon" />
                        <span>Gaming Headsets Comparison</span>
                    </li>
                    <li className="history-item">
                        <History size={16} className="item-icon" />
                        <span>Logitech MX Master 3S</span>
                    </li>
                </ul>
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">JD</div>
                    <div className="user-info">
                        <span className="user-name">제인 도</span>
                        <span className="user-plan">프로 플랜</span>
                    </div>
                </div>
                <button className="settings-btn">
                    <Settings size={20} />
                </button>
            </div>
        </aside>
    );
}
