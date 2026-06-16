// ========== 简历上传 API ==========

import { NextRequest, NextResponse } from 'next/server';
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let content = '';

    // 解析文本
    if (fileType === 'txt') {
      content = buffer.toString('utf-8');
    }
    // 解析 PDF
    else if (fileType === 'pdf') {
      try {
        const pdfModule = await import('pdf-parse');
        const pdfParse = (pdfModule as any).default || pdfModule;
        const parsed = await pdfParse(buffer);
        content = parsed.text;
      } catch {
        return NextResponse.json(
          { error: 'PDF 解析失败，请确认文件未加密且格式正确' },
          { status: 400 }
        );
      }
    }
    // 解析 DOCX
    else if (fileType === 'docx') {
      try {
        const mammothModule = await import('mammoth');
        const mammoth = (mammothModule as any).default || mammothModule;
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } catch {
        return NextResponse.json(
          { error: 'DOCX 解析失败，请确认文件格式正确' },
          { status: 400 }
        );
      }
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
        content: content.slice(0, 5000),
        fileName,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('上传失败:', err);
    return NextResponse.json({ error: '简历解析失败，请确认文件格式正确' }, { status: 500 });
  }
}
