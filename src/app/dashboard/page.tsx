'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';

// 把 useSearchParams 逻辑抽成一个独立组件，用 Suspense 包裹
function DashboardContent() {
  const searchParams = useSearchParams();

  const resumeName = searchParams.get('name') || '未知简历';
  const resumeContent = searchParams.get('content') || '';
  const jd = searchParams.get('jd') || '';

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analyze');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.analysis);
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.optimized);
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.prediction);
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInterview = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.questions);
    } catch {
      setError('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'analyze', label: '📊 简历评分', action: handleAnalyze },
    { key: 'optimize', label: '✨ 一键优化', action: handleOptimize },
    { key: 'predict', label: '🎯 录取预测', action: handlePredict },
    { key: 'interview', label: '🎤 模拟面试', action: handleInterview },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部信息 */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
            {resumeName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{resumeName}</p>
            <p className="text-sm text-gray-500 truncate">JD: {jd.slice(0, 50)}{jd.length > 50 && '...'}</p>
          </div>
          <a href="/" className="text-sm text-blue-500 hover:underline flex-shrink-0">← 重新上传</a>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setResult(null); setError(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 操作区域 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {activeTab === 'analyze' && 'AI 将全面评估你的简历与岗位的匹配度'}
              {activeTab === 'optimize' && 'AI 将根据 JD 要求优化你的简历内容'}
              {activeTab === 'predict' && 'AI 将预测你获得该岗位的概率'}
              {activeTab === 'interview' && 'AI 将生成针对性的面试问题'}
            </p>

            <button
              onClick={tabs.find((t) => t.key === activeTab)?.action}
              disabled={loading || !resumeContent}
              className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  分析中...
                </span>
              ) : (
                '开始分析'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}
          </div>
        </div>

        {/* 结果区域 */}
        {result && (
          <div className="space-y-8" style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* ===== 简历评分结果 ===== */}
            {activeTab === 'analyze' && (
              <>
                {/* 评分卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                    <ScoreRing score={result.score} label="综合评分" />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                    <ScoreRing score={result.atsScore} label="ATS 匹配度" />
                  </div>
                </div>

                {/* 优势 */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-green-700 mb-4">✅ 优势分析</h3>
                  <ul className="space-y-2">
                    {result.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 问题 */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-orange-700 mb-4">⚠️ 需要改进</h3>
                  <ul className="space-y-2">
                    {result.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-orange-500">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 模块建议 */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-blue-700 mb-4">📝 分模块修改建议</h3>
                  <div className="space-y-4">
                    {(Array.isArray(result.suggestions) ? result.suggestions : []).map((s: any, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            {s.section}
                          </span>
                        </div>
                        <div className="grid gap-2 text-sm">
                          <div className="flex gap-2">
                            <span className="text-red-400 w-16 flex-shrink-0">修改前</span>
                            <span className="text-gray-500">{s.original}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-green-500 w-16 flex-shrink-0">修改后</span>
                            <span className="text-gray-700">{s.improved}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-400 w-16 flex-shrink-0">原因</span>
                            <span className="text-gray-400 text-xs">{s.reason}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== 简历优化结果 ===== */}
            {activeTab === 'optimize' && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">✨ 优化后的简历</h3>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-xl">
                    {result.optimizedContent}
                  </pre>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📋 具体改动</h3>
                  <ul className="space-y-2">
                    {(result.changes || []).map((c: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-blue-500">✓</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-500 mb-3 text-sm uppercase tracking-wide">原始版本</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded-xl max-h-96 overflow-auto">
                      {resumeContent.slice(0, 1500)}
                    </pre>
                  </div>
                  <div className="bg-white rounded-2xl border border-green-200 p-6 bg-green-50/30">
                    <h3 className="font-semibold text-green-700 mb-3 text-sm uppercase tracking-wide">优化版本</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 p-4 max-h-96 overflow-auto">
                      {result.optimizedContent}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* ===== 录取预测结果 ===== */}
            {activeTab === 'predict' && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                  <ScoreRing score={result.matchScore} label="综合匹配度" />
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.competitiveness === '高' ? 'bg-green-100 text-green-700' :
                      result.competitiveness === '中' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      竞争力：{result.competitiveness}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-orange-700 mb-4">⚠️ 技能差距</h3>
                    <ul className="space-y-2">
                      {(result.skillGaps || []).map((g: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-orange-500">•</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-blue-700 mb-4">💡 提升建议</h3>
                    <ul className="space-y-2">
                      {(result.recommendations || []).map((r: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-blue-500">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* ===== 模拟面试 ===== */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                {(Array.isArray(result) ? result : []).map((q: any) => (
                  <details key={q.id} className="bg-white rounded-2xl border border-gray-100 p-6 group cursor-pointer">
                    <summary className="flex items-start gap-3 list-none">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded flex-shrink-0 mt-0.5">
                        {q.category}
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {q.question}
                      </span>
                    </summary>
                    <div className="mt-4 pl-14">
                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                        💡 提示：{q.hint}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 空状态提示 */}
        {!result && !loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-4">👆</div>
            <p>点击上方按钮开始分析</p>
            <p className="text-sm mt-1">AI 将根据你的简历和 JD 生成详细结果</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 用 Suspense 包裹，因为 useSearchParams 需要
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
