'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [resume, setResume] = useState<{ id: string; name: string; content: string } | null>(null);
  const [jd, setJd] = useState('');
  const [step, setStep] = useState(0);

  const handleUploaded = (r: { id: string; name: string; content: string }) => {
    setResume(r);
    setStep(1);
  };

  const features = [
    { icon: '📊', title: '简历评分', desc: 'AI 多维评估，告诉你简历哪里好、哪里需要改', tab: 'analyze' },
    { icon: '✨', title: '一键优化', desc: 'AI 自动改写，生成匹配 JD 的优化版简历', tab: 'optimize' },
    { icon: '🎯', title: '录取预测', desc: '分析竞争力，预测匹配度，找到差距', tab: 'predict' },
    { icon: '🎤', title: '模拟面试', desc: 'AI 扮演面试官，生成针对性面试题', tab: 'interview' },
  ];

  const goToDashboard = (tab: string) => {
    if (!resume) return;
    const params = new URLSearchParams({
      tab,
      content: resume.content,
      name: resume.name,
      jd: jd,
    });
    window.location.href = `/dashboard?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-block mb-4 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
          AI 驱动的求职助手
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          让你的简历获得
          <span className="text-blue-500">更多面试机会</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          上传简历 + 输入岗位JD，AI 帮你分析匹配度、一键优化、预测录取概率、生成面试题。
        </p>
      </section>

      {/* Upload Section */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 text-center">上传你的简历</h2>
            <FileUpload onUploaded={handleUploaded} />
          </div>
        )}

        {step === 1 && resume && (
          <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700 text-sm">
              <span>✅</span>
              <span>已解析：<strong>{resume.name}</strong></span>
              <span className="text-green-500">({resume.content.length} 字)</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                粘贴目标岗位 JD（岗位描述）
              </label>
              <textarea
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="例如：金融科技实习生，要求熟悉 SAP FICO 模块，具备数据分析能力..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-30"
              disabled={!jd.trim()}
              onClick={() => setStep(2)}
            >
              开始分析 →
            </button>
          </div>
        )}

        {step === 2 && resume && (
          <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
              <span>🚀</span>
              <span>简历就绪，请选择功能</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <button
                  key={i}
                  onClick={() => goToDashboard(f.tab)}
                  className="block p-5 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group text-left"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">为什么选择 OfferPilot？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'AI 深度分析', desc: '基于大语言模型，模拟资深HR视角，评估简历与岗位的匹配度', icon: '🤖' },
              { title: 'ATS 关键词优化', desc: '自动识别岗位关键词，提升简历在筛选系统中的排名', icon: '🎯' },
              { title: '面试模拟', desc: 'AI 面试官根据简历和JD生成针对性问题，帮你提前准备', icon: '💡' },
              { title: '隐私安全', desc: '上传的简历仅用于本次分析，不会存储或分享你的个人信息', icon: '🔒' },
              { title: '免费起步', desc: '每天免费分析一次，Pro 用户无限使用', icon: '🎁' },
              { title: '开源透明', desc: '项目完全开源，部署简单，可自行托管', icon: '📖' },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>OfferPilot — AI 驱动的求职助手 | 开源项目</p>
      </footer>
    </div>
  );
}
