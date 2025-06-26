# Design Guidelines – Apify 기반 YouTube 분석 서비스

## 🎨 디자인 철학
- **데이터 중심**: 복잡한 분석 결과를 직관적으로 표현
- **프로페셔널**: 비즈니스 사용자를 위한 신뢰할 수 있는 인터페이스
- **효율성**: 빠른 인사이트 도출을 위한 최적화된 UX

## 🌈 컬러 팔레트
- **Primary**: #FF0000 (YouTube Red) - CTA 버튼, 강조 요소
- **Secondary**: #1976D2 (Blue) - 데이터 차트, 정보 섹션
- **Background**: #FFFFFF (White) - 메인 배경
- **Surface**: #F8F9FA (Light Gray) - 카드 배경
- **Text**: #333333 (Dark Gray) - 주요 텍스트
- **Accent**: #4CAF50 (Green) - 성공, 성장 지표
- **Warning**: #FF9800 (Orange) - 주의, 개선 권고

## 📊 데이터 시각화
- **차트 컬러**: Material Design 팔레트 활용
- **그리드 시스템**: 12컬럼 반응형 레이아웃
- **카드 레이아웃**: 분석 결과별 모듈형 구성
- **아이콘**: Lucide React (일관성 있는 아이콘 세트)

## 📱 반응형 디자인
- **Desktop**: 1200px+ (대시보드 중심)
- **Tablet**: 768px-1199px (축약된 차트)
- **Mobile**: 320px-767px (스택형 레이아웃)

## 🔤 타이포그래피
- **Font Family**: 'Pretendard', 'Roboto', sans-serif
- **Headings**: 700 weight, 적절한 line-height
- **Body**: 400 weight, 1.6 line-height
- **Data**: 'JetBrains Mono' (숫자 데이터 표시용)

## 🧩 컴포넌트 구성
- URL 입력창 + 버튼
- 로딩 스피너
- 분석 결과 카드 (요약 텍스트, 키워드 강조)

## ✍️ 폰트/색상
- 폰트: Roboto, sans-serif
- 색상: #FFFFFF, #FF0000, #333333

## 🧭 사용자 흐름
1. URL 입력
2. 결과 기다림
3. 요약 내용 확인 