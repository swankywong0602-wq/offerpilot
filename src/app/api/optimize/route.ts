// ========== 简历优化 API ==========

import { NextRequest, NextResponse } from 'next/server';
import { optimizeResume } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { resumeContent, jobDescription } = await req.json();

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: '请提供简历内容和岗位描述' }, { status: 400 });
    }

    const result = await optimizeResume(resumeContent, jobDescription);

    return NextResponse.json({ success: true, optimized: result });
  } catch (err) {
    console.error('优化失败:', err);
    return NextResponse.json({ error: 'AI 优化失败，请稍后重试' }, { status: 500 });
  }
}
