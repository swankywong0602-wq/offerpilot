// ========== 简历上传 API（接收浏览器端已解析的文本）==========

import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { content, fileName } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '简历内容为空' }, { status: 400 });
    }

    const resumeId = generateId();

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeId,
        name: fileName || '简历',
        content: content.slice(0, 8000),
        fileName: fileName || '未知文件',
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('上传失败:', err);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
