'use client';

import { useState, useCallback } from 'react';

interface Props {
  onUploaded: (resume: { id: string; name: string; content: string }) => void;
}

export default function FileUpload({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // 在浏览器端解析 PDF
  const parsePdfInBrowser = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    setStatus('正在加载 PDF 解析引擎...');

    // 从 CDN 动态加载 pdfjs-dist，完全在浏览器运行
    // CDN 动态加载，完全在浏览器运行，不经过 Vercel 服务器
    const pdfjsModule = await import(
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs'
    );
    const pdfjsLib = pdfjsModule as any;

    // 配置 worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

    setStatus('正在解析 PDF...');
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const pageTexts: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      setStatus(`解析第 ${i}/${doc.numPages} 页...`);
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      pageTexts.push(text);
    }

    return pageTexts.join('\n');
  };

  // 在浏览器端解析 DOCX
  const parseDocxInBrowser = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    setStatus('正在加载 DOCX 解析引擎...');
    const mammoth = (window as any).__mammoth;
    if (mammoth) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // fallback: 从 CDN 加载
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
      script.onload = async () => {
        const m = (window as any).mammoth;
        const result = await m.extractRawText({ arrayBuffer });
        resolve(result.value);
      };
      script.onerror = () => reject(new Error('DOCX 解析引擎加载失败'));
      document.head.appendChild(script);
    });
  };

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
        const buffer = new Uint8Array(arrayBuffer);
        content = new TextDecoder('utf-8').decode(buffer);
      } else if (fileType === 'pdf') {
        content = await parsePdfInBrowser(arrayBuffer);
      } else if (fileType === 'docx') {
        content = await parseDocxInBrowser(arrayBuffer);
      } else {
        setError('仅支持 PDF、DOCX、TXT 格式');
        setIsUploading(false);
        return;
      }

      if (!content.trim()) {
        setError('未能从文件中提取到文本内容，请确认文件格式正确');
        setIsUploading(false);
        return;
      }

      // 发送解析后的文本到后端
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
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
