import { parseInvite, isPublicPreview } from './contract.mjs';

// Public/publishable client key only. Authorization remains in the RPC.
const endpoint = 'https://wbrrpeavykesvtvdexpz.supabase.co/rest/v1/rpc/resolve_share_link_v1';
const publicKey = 'sb_publishable_Qn7sMSXYDOZleisZTKgUdg_WO-ucjqh';
const $ = (id) => document.getElementById(id);
let currentToken = null;
let sequence = 0;
async function resolve() {
  const generation = ++sequence;
  const token = parseInvite($('invite-input').value);
  currentToken = null;
  $('preview').hidden = true;
  if (!token) { $('status').textContent = '올바른 BABAB 초대 링크 또는 코드를 입력해 주세요.'; return; }
  $('resolve').disabled = true;
  $('status').textContent = '공개 상태를 확인하고 있어요…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: { apikey: publicKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_token: token }), signal: AbortSignal.timeout(15000),
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error('unavailable');
    const preview = await response.json();
    if (generation !== sequence) return;
    if (!isPublicPreview(preview)) { $('status').textContent = '만료·철회되었거나 현재 공개할 수 없는 초대예요.'; return; }
    $('preview-title').textContent = preview.title;
    $('preview-body').textContent = preview.body;
    $('preview-area').textContent = preview.coarse_region || '';
    $('preview-count').textContent = Number.isSafeInteger(preview.waiting_count) ? `지역 신청 ${preview.waiting_count}명 · 인원만으로 자동 개방되지 않아요.` : '';
    $('preview-time').textContent = '';
    if (preview.scheduled_at) {
      const date = new Date(preview.scheduled_at);
      if (Number.isFinite(date.valueOf())) $('preview-time').textContent = new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: preview.timezone_identifier || 'Asia/Seoul',
      }).format(date);
    }
    currentToken = token;
    $('open-app').href = `babab://invite?code=${token}`;
    $('preview').hidden = false;
    $('status').textContent = '공개용 미리보기예요. 최신 상태는 앱에서 다시 확인합니다.';
  } catch {
    if (generation === sequence) $('status').textContent = '연결을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.';
  } finally { if (generation === sequence) $('resolve').disabled = false; }
}
$('resolve').addEventListener('click', resolve);
$('invite-input').addEventListener('input', () => {
  sequence += 1; currentToken = null; $('preview').hidden = true; $('resolve').disabled = false;
});
$('copy-code').addEventListener('click', async () => {
  if (!currentToken) return;
  try { await navigator.clipboard.writeText(currentToken); $('status').textContent = '코드를 복사했어요. 설치 후 ‘받은 초대 복원’에 붙여 넣어 주세요.'; }
  catch { $('invite-input').value = currentToken; $('invite-input').select(); $('status').textContent = '선택된 코드를 직접 복사해 주세요.'; }
});
const code = new URL(location.href).searchParams.getAll('code');
if (code.length === 1 && parseInvite(code[0])) { $('invite-input').value = code[0]; resolve(); }
