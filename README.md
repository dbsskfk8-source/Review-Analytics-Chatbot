💬 Review Analytics Chatbot
사용자의 제품 리뷰를 분석하고 인사이트를 제공하는 Next.js 기반 지능형 챗봇입니다.

🏗️ 시스템 아키텍처

graph LR
    User((사용자)) -->|질문| Frontend[@src]
    Frontend -->|인증/데이터| Supabase[@supabase]
    Frontend -->|AI 처리| LLM[OpenAI / Analytics Engine]
📂 핵심 코드 가이드

데이터베이스/인증: @supabase 폴더에서 스키마와 인증 설정을 관리합니다.

프론트엔드 로직: @src 폴더에 React 컴포넌트와 챗봇 인터페이스 코드가 포함되어 있습니다.

프로젝트 설정: @package.json에서 Next.js 및 관련 라이브러리 의존성을 확인할 수 있습니다.
