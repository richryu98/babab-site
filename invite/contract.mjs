export function parseInvite(input) {
  const value = input.trim();
  if (/^[a-f0-9]{32}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const canonical = url.protocol === 'https:' && url.hostname === 'richryu98.github.io' && url.pathname === '/babab-site/invite/';
    const app = url.protocol === 'babab:' && url.hostname === 'invite' && url.pathname === '';
    if ((!canonical && !app) || url.username || url.password || url.port || url.hash) return null;
    const codes = url.searchParams.getAll('code');
    return codes.length === 1 && /^[a-f0-9]{32}$/.test(codes[0]) ? codes[0] : null;
  } catch { return null; }
}

export function isPublicPreview(value) {
  return value && ['app', 'area', 'curated', 'story'].includes(value.kind)
    && typeof value.title === 'string' && value.title.length <= 300
    && typeof value.body === 'string' && value.body.length <= 2000;
}
