function getBaseUrl() {
  const base =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined. Please create a .env.local file with NEXT_PUBLIC_API_URL=<your backend url>.'
    );
  }
  return base.replace(/\/$/, '');
}

// FIX #1: Tambah detail=full agar backend menyertakan headlines[]
export async function fetchAnalyze(ticker) {
  const baseUrl = getBaseUrl();
  let res;
  try {
    res = await fetch(
      `${baseUrl}/api/bi?ticker=${encodeURIComponent(ticker)}&detail=full`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' }
    );
  } catch {
    throw new Error(
      `Network error – could not reach ${baseUrl}. Check your API server and NEXT_PUBLIC_API_URL.`
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`.trim());
  }
  return res.json();
}

function toWebSocketUrl(httpUrl) {
  if (httpUrl.startsWith('https://')) return httpUrl.replace('https://', 'wss://');
  if (httpUrl.startsWith('http://'))  return httpUrl.replace('http://', 'ws://');
  return httpUrl;
}

export function createRealtimeAnalyzeSocket({ ticker, onMessage, onError, onStatus }) {
  let baseUrl;
  try { baseUrl = getBaseUrl(); }
  catch (e) { onError?.(e); return { socket: null, sendTick: () => {}, close: () => {} }; }

  const wsUrl = `${toWebSocketUrl(baseUrl)}/ws`;
  let socket;
  try { socket = new WebSocket(wsUrl); }
  catch (e) { onError?.(e); return { socket: null, sendTick: () => {}, close: () => {} }; }

  socket.addEventListener('open', () => {
    try {
      onStatus?.('connected');
      // FIX #1: Kirim detail=full via WebSocket juga
      socket.send(JSON.stringify({ ticker, detail: 'full' }));
    } catch (e) { onError?.(e); }
  });

  socket.addEventListener('message', (event) => {
    try { onMessage?.(JSON.parse(event.data)); }
    catch { onMessage?.({ raw: event.data }); }
  });

  socket.addEventListener('error', (e) => { onStatus?.('error'); onError?.(e); });
  socket.addEventListener('close', () => { onStatus?.('disconnected'); });

  return {
    socket,
    sendTick: () => {
      if (socket.readyState === WebSocket.OPEN) {
        try { socket.send(JSON.stringify({ ticker, detail: 'full' })); } catch {}
      }
    },
    close: () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
        socket.close();
    },
  };
}

// Fetch batch: pakai POST /api/batch untuk mode comparison
export async function fetchBatch(tickers) {
  const baseUrl = getBaseUrl();
  let res;
  try {
    res = await fetch(`${baseUrl}/api/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tickers),
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Network error – could not reach ${baseUrl}.`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Batch API error ${res.status}: ${text || res.statusText}`.trim());
  }
  return res.json();
}

// Fetch ringkasan semua saham IDX untuk IHSG Dashboard
export async function fetchIDXSummary(tickers = []) {
  const baseUrl = getBaseUrl();
  const results = await Promise.allSettled(
    tickers.map(ticker =>
      fetch(`${baseUrl}/api/bi?ticker=${encodeURIComponent(ticker)}&detail=summary`, {
        cache: 'no-store',
      }).then(r => r.json())
    )
  );
  return results;
}
