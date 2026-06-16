// ========== 简历上传 API ==========

import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/db';

// 用 pdfjs-dist legacy 版本解析 PDF（不需要 canvas，Vercel 兼容）
async function extractPdfText(data: Uint8Array): Promise<string> {
  // 使用 legacy build，不依赖 canvas 原生模块
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const doc = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
  }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');
    pageTexts.push(text);
  }

  return pageTexts.join('\n');
}

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

    // 纯文本直接读
    if (fileType === 'txt') {
      content = buffer.toString('utf-8');
    }
    // PDF — pdfjs-dist legacy build，纯 JS，Vercel 完全兼容
    else if (fileType === 'pdf') {
      try {
        content = await extractPdfText(new Uint8Array(arrayBuffer));
      } catch (e) {
        console.error('PDF parse error:', e);
        return NextResponse.json(
          { error: 'PDF 解析失败，请确认文件未加密且格式正确' },
          { status: 400 }
        );
      }
    }
    // DOCX — mammoth，纯 JS
    else if (fileType === 'docx') {
      try {
        const mammothModule = await import('mammoth');
        const mammoth = (mammothModule as any).default || mammothModule;
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } catch (e) {
        console.error('DOCX parse error:', e);
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
