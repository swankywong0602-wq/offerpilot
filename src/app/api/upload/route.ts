// ========== 简历上传 API ==========

import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';
import { generateId } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请上传简历文件' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let content = '';

    // 解析 PDF
    if (fileType === 'pdf') {
      const parsed = await pdfParse(buffer);
      content = parsed.text;
    }
    // 解析 DOCX
    else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    }
    // 纯文本直接读
    else if (fileType === 'txt') {
      content = buffer.toString('utf-8');
    }
    else {
      return NextResponse.json({ error: '仅支持 PDF、DOCX、TXT 格式' }, { status: 400 });
    }

    if (!content.trim()) {
      return NextResponse.json({ error: '未能从文件中提取到文本内容' }, { status: 400 });
    }

    const resumeId = generateId();

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeId,
        name: fileName,
        content: content.slice(0, 5000), // 限制长度
        fileName,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('上传失败:', err);
    return NextResponse.json({ error: '简历解析失败，请确认文件格式正确' }, { status: 500 });
  }
}
