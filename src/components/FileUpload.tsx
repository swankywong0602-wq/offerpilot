'use client';

import { useState, useCallback } from 'react';

interface Props {
  onUploaded: (resume: { id: string; name: string; content: string }) => void;
}

// 简单的纯文本 PDF 解析——从二进制中提取可读文本
// 不依赖任何外部库，完全在浏览器运行
function extractPdfTextFromBinary(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer);
  const text = new TextDecoder('utf-8').decode(uint8);

  // 尝试提取 PDF 流中的文本
  const parts: string[] = [];

  // 匹配 BT...ET 块（PDF 文本块）
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btRegex.exec(text)) !== null) {
    const block = match[1];
    // 提取 Tj、TJ、'、" 操作符中的文本
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const str = tjMatch[1];
      if (str && !/^[.\-+\d\s]*$/.test(str) && str.length > 1) {
        parts.push(str);
      }
    }
  }

  if (parts.length > 20) {
    return parts.join(' ');
  }

  // fallback: 从原始文本中提取可打印字符序列
  const printable = text.replace(/[^\x20-\x7E一-鿿　-〿＀-￯\n\r]/g, '');
  const lines = printable.split('\n').filter(l => {
    const trimmed = l.trim();
    return trimmed.length > 10 && !/^[.\-+\d\s]*$/.test(trimmed);
  });

  if (lines.length > 5) {
    return lines.join('\n');
  }

  return printable.slice(0, 5000);
}

// 简单的 DOCX 文本提取——DOCX 本质是 ZIP 包
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  // DOCX 的 XML 内容通常可以直接从二进制中提取
  const uint8 = new Uint8Array(buffer);
  const text = new TextDecoder('utf-8').decode(uint8);

  // 提取 <w:t> 标签中的文本
  const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  const parts: string[] = [];
  let match;
  while ((match = wtRegex.exec(text)) !== null) {
    if (match[1].trim()) parts.push(match[1]);
  }

  return parts.join('');
}

export default function FileUpload({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setIsUploading(true);
    setStatus('正在读取文件...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileName = file.name;
      const fileType = fileName.split('.').pop()?.toLowerCase();

      let content = '';

      if (fileType === 'txt') {
        content = new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer));
      } else if (fileType === 'pdf') {
        setStatus('正在解析 PDF...');
        content = extractPdfTextFromBinary(arrayBuffer);
      } else if (fileType === 'docx') {
        setStatus('正在解析 DOCX...');
        content = await extractDocxText(arrayBuffer);
      } else {
        setError('仅支持 PDF、DOCX、TXT 格式');
        setIsUploading(false);
        return;
      }

      if (!content.trim()) {
        setError('未能从文件中提取到文本内容。请确保文件是文本型 PDF（非扫描图片），或直接上传 TXT 格式。');
        setIsUploading(false);
        return;
      }

      setStatus('正在保存...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, 8000), fileName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '上传失败');
        return;
      }

      onUploaded(data.resume);
    } catch (err) {
      console.error('解析失败:', err);
      setError('文件解析失败，请确认文件未损坏');
    } finally {
      setIsUploading(false);
      setStatus('');
    }
  }, [onUploaded]);

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.docx,.txt';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        {isUploading ? (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500">{status || '正在解析简历...'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">拖拽简历文件到此处，或点击上传</p>
              <p className="text-gray-400 text-sm mt-1">支持 PDF、DOCX、TXT 格式</p>
              <p className="text-gray-300 text-xs mt-2">⚠ 扫描图片型 PDF 无法识别，请上传文本型 PDF</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
