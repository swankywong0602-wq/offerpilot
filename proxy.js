// Cloudflare Worker 反向代理 → Vercel
// 国内用户通过 workers.dev 访问，Worker 帮你转到 Vercel
const TARGET = 'https://offerpilot-ashen.vercel.app';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = TARGET + url.pathname + url.search;

    // 透传所有请求，包括 API POST
    const modified = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
      redirect: 'manual',
    });

    const response = await fetch(modified);

    // 透传响应，保持所有 header
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};
