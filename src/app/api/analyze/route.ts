// ========== 简历分析 API ==========

import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { resumeContent, jobDescription } = await req.json();

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: '请提供简历内容和岗位描述' }, { status: 400 });
    }

    const result = await analyzeResume(resumeContent, jobDescription);

    return NextResponse.json({ success: true, analysis: result });
  } catch (err) {
    console.error('分析失败:', err);
    return NextResponse.json({ error: 'AI 分析失败，请稍后重试' }, { status: 500 });
  }
}
