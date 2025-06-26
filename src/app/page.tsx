'use client'

import { useState } from 'react';

// 영상 데이터 타입 정의
interface VideoData {
  id: string;
  title: string;
  description?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  published_at?: string;
  transcript?: string;
}

// AI 분석 결과 타입 정의 - 단순한 텍스트 형태
interface AIAnalysis {
  report_text?: string;
}

// 분석 결과 타입 정의
interface AnalysisResult {
  videos: VideoData[];
  ai_analysis?: AIAnalysis;
  ai_analysis_metadata?: {
    cost_estimate?: {
      estimated_cost_usd: number;
      estimated_cost_krw: number;
    };
    analysis_duration_ms?: number;
  };
  analysis_summary?: {
    total_views?: number;
  };
  keyword_analysis?: Array<{
    word: string;
    count: number;
    percentage: string;
  }>;
  engagement_analysis?: {
    avg_views?: number;
    most_viewed?: VideoData;
    least_viewed?: VideoData;
    view_distribution?: {
      over_1m: number;
      over_100k: number;
      over_10k: number;
      under_10k: number;
    };
  };
}

export default function Home() {
  // 유튜브 URL 입력값을 저장하는 상태 (state)
  const [youtube_url, set_youtube_url] = useState('');
  // 로딩 상태를 관리하는 변수
  const [is_loading, set_is_loading] = useState(false);
  // 영상 개수 옵션
  const [max_videos, set_max_videos] = useState(5);
  // 로딩 단계 관리
  const [loading_step, set_loading_step] = useState(0);
  // 모달 상태 관리
  const [show_result_modal, set_show_result_modal] = useState(false);
  // 분석 결과 데이터
  const [analysis_result, set_analysis_result] = useState<AnalysisResult | null>(null);
  
  // 로딩 단계 정의 (AI 분석 항상 포함)
  const loading_steps = [
    { step: 1, title: "YouTube 데이터 수집 중", description: "채널 정보와 영상 목록을 가져오고 있어요", icon: "🔍" },
    { step: 2, title: "자막 분석 중", description: "영상별 자막을 추출하고 분석하고 있어요", icon: "📝" },
    { step: 3, title: "AI 분석 중", description: "GPT-4로 트렌드 패턴을 분석하고 있어요", icon: "🤖" },
    { step: 4, title: "결과 정리 중", description: "분석 결과를 정리하고 있어요", icon: "📊" }
  ];

  // 메모장 스타일의 단순한 텍스트 분석 결과 컴포넌트
  const SimpleAnalysisReport = ({ reportText }: { reportText: string }) => {
    return (
      <div className="bg-white border border-gray-300 rounded p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-normal text-black bg-white">
          {reportText}
        </pre>
      </div>
    );
  };

  // URL 입력창에서 값이 변경될 때 실행되는 함수
  const handle_url_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_youtube_url(e.target.value);
  };

  // 모달 닫기 함수
  const close_modal = () => {
    set_show_result_modal(false);
    set_analysis_result(null);
  };

  // 분석 시작 버튼을 클릭했을 때 실행되는 함수
  const handle_analyze_click = async () => {
    // 빈 URL인지 확인
    if (!youtube_url.trim()) {
      alert('유튜브 URL을 입력해주세요!');
      return;
    }

    // 유튜브 URL 형식인지 간단히 확인
    if (!youtube_url.includes('youtube.com') && !youtube_url.includes('youtu.be')) {
      alert('올바른 유튜브 URL을 입력해주세요!');
      return;
    }

    set_is_loading(true);
    
    try {
      console.log('🚀 분석 시작:', youtube_url);
      
      // 1단계: YouTube 데이터 수집 시작
      set_loading_step(1);
      await new Promise(resolve => setTimeout(resolve, 500)); // 사용자가 단계를 볼 수 있도록 잠시 대기
      
      // 2단계: 자막 분석 시작
      set_loading_step(2);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 사용자가 단계를 볼 수 있도록 잠시 대기
      
      // 3단계: AI 분석 시작 (선택적)
      set_loading_step(3);
      
      // 4단계: 결과 정리 시작
      set_loading_step(4);
      
      // API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: youtube_url,
          maxVideos: max_videos,
          includeAIAnalysis: true
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 성공: 결과를 localStorage에 저장
        localStorage.setItem('analysis_result', JSON.stringify(result.data));
        
        // 콘솔에 자세한 정보 출력 (개발자 도구에서 확인 가능)
        console.log('✅ YouTube 분석 성공!');
        console.log(`📊 총 ${result.data.videos.length}개 영상 수집`);
        console.log('📝 영상 목록:');
        
        result.data.videos.forEach((video: VideoData, index: number) => {
          console.log(`${index + 1}. ${video.title}`);
          console.log(`   조회수: ${video.view_count?.toLocaleString() || '정보 없음'}, 발행일: ${video.published_at}`);
          console.log(`   자막: ${video.transcript ? `있음 (${video.transcript.length}자)` : '없음'}`);
          if (video.transcript && video.transcript.length > 100) {
            console.log(`   자막 미리보기: ${video.transcript.substring(0, 100)}...`);
          }
          console.log('');
        });
        
        // AI 분석 결과 로깅
        if (result.data.ai_analysis) {
          console.log('🤖 AI 분석 결과:');
          console.log(result.data.ai_analysis);
          console.log('💰 AI 분석 비용:', result.data.ai_analysis_metadata?.cost_estimate);
        }
        
        // 분석 결과를 상태에 저장하고 모달 표시
        set_analysis_result(result.data);
        set_show_result_modal(true);
        
      } else {
        // 에러 처리
        alert(`오류: ${result.error}`);
        if (result.debug) {
          console.error('디버그 정보:', result.debug);
        }
      }
    } catch (error) {
      console.error('요청 실패:', error);
      alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
    } finally {
      set_is_loading(false);
      set_loading_step(0);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 영역 */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">📺 유튜브 트렌드 분석기</h1>
        </div>
      </header>

      {/* 분석 결과 모달 - 메모장 스타일 */}
      {show_result_modal && analysis_result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-400">
            {/* 모달 헤더 - 단순 스타일 */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold text-black">AI 분석 결과</h1>
                <button
                  onClick={close_modal}
                  className="text-gray-600 hover:text-black text-lg px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 모달 내용 - 메모장 스타일 */}
            <div className="p-4">
              {/* AI 분석 결과 - 단순 텍스트 */}
              {analysis_result.ai_analysis?.report_text && (
                <SimpleAnalysisReport reportText={analysis_result.ai_analysis.report_text} />
              )}

              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={close_modal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {is_loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-mx-4 shadow-2xl">
            {/* 현재 단계 표시 */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">
                {loading_steps[loading_step - 1]?.icon || '⏳'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {loading_steps[loading_step - 1]?.title || '분석 중...'}
              </h3>
              <p className="text-gray-600">
                {loading_steps[loading_step - 1]?.description || '잠시만 기다려주세요'}
              </p>
            </div>

            {/* 진행률 표시 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>진행률</span>
                <span>{Math.round((loading_step / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${Math.min((loading_step / 4) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* 단계별 체크리스트 */}
            <div className="space-y-3">
              {loading_steps.map((step) => (
                <div key={step.step} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                    loading_step > step.step 
                      ? 'bg-green-500 text-white' 
                      : loading_step === step.step 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {loading_step > step.step ? '✓' : step.step}
                  </div>
                  <span className={`text-sm ${
                    loading_step >= step.step ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title.replace(' 중', '')}
                  </span>
                  {loading_step === step.step && (
                    <div className="ml-auto">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 예상 소요 시간 */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ⏱️ 예상 소요 시간: 10-20초
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 서비스 소개 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            유튜브 채널 트렌드를 <span className="text-red-600">AI로 분석</span>
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            인기 유튜브 채널의 최신 영상 {max_videos}개를 AI로 분석해서
          </p>
          <p className="text-xl text-gray-600 mb-8">
            트렌드 주제, 키워드, 콘텐츠 전략까지 상세하게 알려드려요!
          </p>
        </div>

        {/* URL 입력 카드 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            분석하고 싶은 유튜브 채널 URL을 입력하세요
          </h3>
          
          <div className="space-y-4">
            {/* URL 입력창 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유튜브 채널 또는 영상 URL
              </label>
                             <input
                 type="url"
                 value={youtube_url}
                 onChange={handle_url_change}
                 placeholder="https://www.youtube.com/channel/... 또는 https://youtu.be/..."
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg placeholder:text-gray-700 text-gray-900"
                 disabled={is_loading}
               />
            </div>

            {/* 분석 옵션 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 영상 개수 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분석할 영상 개수
                </label>
                <select
                  value={max_videos}
                  onChange={(e) => set_max_videos(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                  disabled={is_loading}
                >
                  <option value={3}>3개 (빠른 분석)</option>
                  <option value={5}>5개 (권장)</option>
                  <option value={10}>10개 (상세 분석)</option>
                  <option value={20}>20개 (심화 분석)</option>
                </select>
              </div>
            </div>

            {/* 분석 시작 버튼 */}
            <button
              onClick={handle_analyze_click}
              disabled={is_loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors duration-200"
            >
              {is_loading ? '📊 데이터 수집 중...' : `🚀 AI 트렌드 분석 시작 (${max_videos}개 영상)`}
            </button>
          </div>
        </div>

        {/* 사용법 안내 섹션 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 사용법</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-red-600 text-2xl mb-2">1️⃣</div>
              <h5 className="font-medium text-gray-900 mb-1">URL 입력</h5>
              <p className="text-sm text-gray-600">분석하고 싶은 유튜브 채널이나 영상의 URL을 입력하세요</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-red-600 text-2xl mb-2">2️⃣</div>
              <h5 className="font-medium text-gray-900 mb-1">AI 트렌드 분석</h5>
              <p className="text-sm text-gray-600">영상들의 제목과 자막을 GPT-4가 심층 분석합니다</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-red-600 text-2xl mb-2">3️⃣</div>
              <h5 className="font-medium text-gray-900 mb-1">AI 인사이트 확인</h5>
              <p className="text-sm text-gray-600">트렌드 키워드, 콘텐츠 전략, 성장 방향을 확인하세요</p>
            </div>
          </div>
        </div>

        {/* 예시 URL 섹션 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">💡 예시 URL:</p>
          <div className="text-sm text-gray-400 space-y-1">
            <div>https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw</div>
            <div>https://youtu.be/dQw4w9WgXcQ</div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            유튜브 트렌드 분석기 - 크리에이터를 위한 AI 분석 도구
          </p>
        </div>
      </footer>
    </div>
  );
}
