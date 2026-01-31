/**
 * Vercel Serverless Function - CORS Proxy for Saudi Open Data
 *
 * This runs on Vercel's edge network and proxies requests to open.data.gov.sa
 * Bypasses CORS issues since it's a server-side request
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Only allow requests to Saudi Open Data
  if (!url.startsWith('https://open.data.gov.sa/')) {
    return res.status(403).json({ error: 'Only open.data.gov.sa is allowed' });
  }

  try {
    console.log(`🔄 Proxying request to: ${url}`);

    // Follow redirects manually and handle different response types
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ar,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://open.data.gov.sa/',
        'Origin': 'https://open.data.gov.sa',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    console.log(`📥 Response status: ${response.status}, Content-Type: ${contentType}`);

    // Check if response is HTML (error page or redirect)
    if (contentType.includes('text/html') || responseText.startsWith('<')) {
      console.error('❌ Got HTML response instead of JSON');
      return res.status(502).json({
        error: 'API returned HTML instead of JSON',
        hint: 'The Saudi Open Data API might be blocking requests or returning an error page',
        status: response.status,
      });
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Got JSON response`);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', responseText.substring(0, 200));
      return res.status(502).json({
        error: 'Invalid JSON response',
        preview: responseText.substring(0, 500),
      });
    }
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message);
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
}
