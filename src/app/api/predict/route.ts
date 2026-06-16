// ========== 录取概率预测 API ==========

import { NextRequest, NextResponse } from 'next/server';
import { predictMatch } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { resumeContent, jobDescription } = await req.json();

    if (!resumeContent || !jobDescription) {
      return NextResponse.json({ error: '请提供简历内容和岗位描述' }, { status: 400 });
    }

    const result = await predictMatch(resumeContent, jobDescription);

    return NextResponse.json({ success: true, prediction: result });
  } catch (err) {
    console.error('预测失败:', err);
    return NextResponse.json({ error: 'AI 预测失败，请稍后重试' }, { status: 500 });
  }
}
