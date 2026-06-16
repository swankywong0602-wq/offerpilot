// ========== AI 模拟面试 API ==========

import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { resumeContent, jobDescription } = await req.json();

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: '请提供简历内容和岗位描述' }, { status: 400 });
    }

    const questions = await generateInterviewQuestions(resumeContent, jobDescription);

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error('生成面试题失败:', err);
    return NextResponse.json({ error: 'AI 生成失败，请稍后重试' }, { status: 500 });
  }
}
