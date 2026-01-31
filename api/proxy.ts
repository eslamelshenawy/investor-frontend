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

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`❌ Upstream error: ${response.status}`);
      return res.status(response.status).json({
        error: `Upstream returned ${response.status}`,
        status: response.status,
      });
    }

    const data = await response.json();
    console.log(`✅ Got response, returning data`);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message);
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
}
