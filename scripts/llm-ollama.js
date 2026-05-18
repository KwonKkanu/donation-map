/* eslint-disable no-console */

// Ollama local LLM adapter.
// Requires: Ollama running on http://127.0.0.1:11434

const REFINED_SCHEMA_VERSION = 2;

const TARGETS = [
  '아동/청소년',
  '노인',
  '장애인',
  '여성/가족',
  '저소득/취약계층',
  '재난/위기',
  '동물',
  '환경',
  '지역사회',
  '해외/국제',
  '기타',
];

const SUPPORT_TYPES = [
  '생계지원',
  '의료지원',
  '주거지원',
  '교육지원',
  '식사지원',
  '심리/정서지원',
  '보호/돌봄',
  '문화/여가',
  '환경개선',
  '긴급구호',
  '인식개선/캠페인',
  '기타',
];

const GENERIC_TAGS = new Set([
  '기부',
  '모금',
  '지원',
  '캠페인',
  '프로젝트',
  '도움',
  '후원',
  '나눔',
  '사랑',
  '함께',
  '필요',
  '응원',
  'kakao',
  'kakao together',
  'goodneighbors',
  'naver',
  'happybean',
]);

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function stripNewlines(s) {
  return String(s ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function truncateText(s, maxLen) {
  const str = stripNewlines(s);
  if (str.length <= maxLen) return str;

  const sliced = str.slice(0, maxLen + 1);
  const boundary = Math.max(
    sliced.lastIndexOf('.'),
    sliced.lastIndexOf('!'),
    sliced.lastIndexOf('?'),
    sliced.lastIndexOf(' '),
    sliced.lastIndexOf(',')
  );
  const cut = boundary >= Math.floor(maxLen * 0.6) ? sliced.slice(0, boundary) : str.slice(0, maxLen);
  return cut.trim();
}

function isMostlyKorean(s) {
  const str = stripNewlines(s);
  if (!str) return false;
  const hangul = (str.match(/[가-힣]/g) || []).length;
  const latin = (str.match(/[A-Za-z]/g) || []).length;
  return hangul >= 1 && latin <= Math.max(2, Math.floor(hangul * 0.5));
}

function normalizeEnum(value, allowed, fallback = '기타') {
  const raw = stripNewlines(value);
  return allowed.includes(raw) ? raw : fallback;
}

function textForRules(campaign) {
  return [
    campaign?.titleRaw,
    campaign?.summaryRaw,
    campaign?.categoryRaw,
    campaign?.orgRaw,
  ]
    .filter(Boolean)
    .join(' ');
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function classifyTargetByRules(campaign) {
  const text = textForRules(campaign);
  if (includesAny(text, ['동물', '유기견', '유기묘', '반려', '길고양이', '구조묘', '구조견'])) return '동물';
  if (includesAny(text, ['어르신', '노인', '독거', '고령', '조부모'])) return '노인';
  if (includesAny(text, ['장애', '발달장애', '시각장애', '청각장애'])) return '장애인';
  if (includesAny(text, ['해외', '난민', '국제', '아프리카', '우크라이나', '튀르키예', '미얀마', '레바논', '중동'])) return '해외/국제';
  if (includesAny(text, ['재난', '위기', '화재', '수해', '지진', '폭격', '전쟁', '분쟁'])) return '재난/위기';
  if (includesAny(text, ['아동', '청소년', '아이', '어린이', '아기', '학생'])) return '아동/청소년';
  if (includesAny(text, ['여성', '한부모', '가족', '엄마', '미혼모', '소녀', '생리대'])) return '여성/가족';
  if (includesAny(text, ['환경', '기후', '숲', '바다', '생태'])) return '환경';
  if (includesAny(text, ['저소득', '취약계층', '빈곤', '생계', '쪽방', '자립준비청년'])) return '저소득/취약계층';
  if (includesAny(text, ['마을', '지역', '공동체', '주민'])) return '지역사회';
  return '기타';
}

function classifySupportTypeByRules(campaign) {
  const text = textForRules(campaign);
  if (includesAny(text, ['재난', '긴급', '화재', '수해', '지진', '구호', '폭격', '전쟁', '분쟁'])) return '긴급구호';
  if (includesAny(text, ['집', '주거', '보금자리', '수리', '개보수', '리모델링'])) return '주거지원';
  if (includesAny(text, ['식사', '도시락', '반찬', '급식', '김치', '먹거리'])) return '식사지원';
  if (includesAny(text, ['치료', '수술', '병원', '의료', '약값', '진료'])) return '의료지원';
  if (includesAny(text, ['교육', '학습', '장학', '학교', '공부', '교실'])) return '교육지원';
  if (includesAny(text, ['생계', '생활비', '생필품', '난방비', '공과금'])) return '생계지원';
  if (includesAny(text, ['상담', '마음', '정서', '심리', '외로움'])) return '심리/정서지원';
  if (includesAny(text, ['돌봄', '보호', '쉼터', '안전'])) return '보호/돌봄';
  if (includesAny(text, ['문화', '여가', '캠프', '여행', '놀이'])) return '문화/여가';
  if (includesAny(text, ['환경개선', '공간', '시설', '청소', '위생'])) return '환경개선';
  if (includesAny(text, ['인식개선', '캠페인', '권리', '홍보'])) return '인식개선/캠페인';
  return '기타';
}

function normalizeSummary(value, campaign, maxLen = 50) {
  const candidate = stripNewlines(value) || stripNewlines(campaign?.summaryRaw) || stripNewlines(campaign?.categoryRaw);
  return truncateText(candidate, maxLen);
}

function looksLikeParticleOrVerbTag(tag) {
  return /(합니다|해주세요|주세요|위해|위한|되는|하는|하고|하게|에서|으로|에게)$/.test(tag);
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  const out = [];
  const seen = new Set();
  for (const raw of tags) {
    const tag = stripNewlines(raw).replace(/^#+/, '').trim();
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    if (tag.length > 14) continue;
    if (GENERIC_TAGS.has(key) || GENERIC_TAGS.has(tag)) continue;
    if (looksLikeParticleOrVerbTag(tag)) continue;
    if (!isMostlyKorean(tag)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= 5) break;
  }
  return out;
}

function deriveRuleTags(campaign) {
  const text = textForRules(campaign);
  const keywordTags = [
    ['어르신', ['어르신']],
    ['노인', ['노인']],
    ['독거', ['독거']],
    ['시각장애', ['시각장애인']],
    ['발달장애', ['발달장애']],
    ['장애', ['장애인']],
    ['아동', ['아동']],
    ['청소년', ['청소년']],
    ['어린이', ['어린이']],
    ['자립준비청년', ['자립준비청년']],
    ['여성', ['여성']],
    ['소녀', ['소녀']],
    ['생리대', ['생리대']],
    ['동물', ['동물']],
    ['유기견', ['유기견']],
    ['유기묘', ['유기묘']],
    ['구조묘', ['구조묘']],
    ['해외', ['해외']],
    ['난민', ['난민']],
    ['미얀마', ['미얀마']],
    ['레바논', ['레바논']],
    ['주거', ['주거']],
    ['집', ['주거']],
    ['식사', ['식사']],
    ['김치', ['김치']],
    ['도시락', ['도시락']],
    ['치료', ['치료']],
    ['수술', ['수술']],
    ['의료', ['의료']],
    ['교육', ['교육']],
    ['장학', ['장학']],
    ['재난', ['재난']],
    ['긴급', ['긴급구호']],
    ['폭염', ['폭염']],
    ['화재', ['화재']],
    ['심리', ['심리']],
    ['정서', ['정서']],
    ['돌봄', ['돌봄']],
    ['여행', ['여행']],
    ['인식개선', ['인식개선']],
    ['환경개선', ['환경개선']],
  ];

  const out = [];
  for (const [keyword, tags] of keywordTags) {
    if (!text.includes(keyword)) continue;
    for (const tag of tags) out.push(tag);
  }
  return normalizeTags(out);
}

function mergeTags(primary, fallback) {
  return normalizeTags([...(Array.isArray(primary) ? primary : []), ...(Array.isArray(fallback) ? fallback : [])]);
}

function fallbackRefinedCampaign(campaign) {
  const target = classifyTargetByRules(campaign);
  const supportType = classifySupportTypeByRules(campaign);
  const tags = deriveRuleTags(campaign);
  return {
    title: stripNewlines(campaign?.titleRaw),
    oneLineSummary: normalizeSummary(undefined, campaign),
    target,
    supportType,
    category: target,
    tags,
  };
}

function sanitizeRefinedCampaign(parsed, campaign) {
  if (!parsed || typeof parsed !== 'object') return fallbackRefinedCampaign(campaign);

  const ruleTarget = classifyTargetByRules(campaign);
  const ruleSupportType = classifySupportTypeByRules(campaign);
  const llmTarget = normalizeEnum(parsed.target, TARGETS);
  const llmSupportType = normalizeEnum(parsed.supportType, SUPPORT_TYPES);
  const target = ruleTarget !== '기타' ? ruleTarget : llmTarget;
  const supportType = ruleSupportType !== '기타' ? ruleSupportType : llmSupportType;
  const title = stripNewlines(campaign?.titleRaw) || stripNewlines(parsed.title) || '';
  const oneLineSummary = normalizeSummary(parsed.oneLineSummary, campaign);
  const tags = mergeTags(parsed.tags, deriveRuleTags(campaign));

  return {
    title,
    oneLineSummary,
    target,
    supportType,
    category: target,
    tags,
  };
}

async function ollamaChat({ host, model, messages, format, options, signal }) {
  const url = new URL('/api/chat', host || 'http://127.0.0.1:11434');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      ...(format ? { format } : {}),
      ...(options ? { options } : {}),
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}${text ? `: ${text.slice(0, 300)}` : ''}`);
  }
  return res.json();
}

async function ollamaTags({ host, signal } = {}) {
  const url = new URL('/api/tags', host || 'http://127.0.0.1:11434');
  const res = await fetch(url, { method: 'GET', signal });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`);
  }
  return res.json();
}

async function ollamaHasModel(model, { host, signal } = {}) {
  const j = await ollamaTags({ host, signal });
  const models = Array.isArray(j?.models) ? j.models : [];
  return models.some((m) => m?.name === model);
}

/**
 * @param {any} campaign normalized campaign
 * @returns {Promise<{title:string, oneLineSummary:string, target:string, supportType:string, category:string, tags:string[]}>}
 */
async function refineCampaignWithOllama(campaign, { host, model = 'llama3.2:1b', signal } = {}) {
  const input = pick(campaign, [
    'source',
    'platform',
    'titleRaw',
    'orgRaw',
    'summaryRaw',
    'categoryRaw',
    'link',
    'startDate',
    'endDate',
    'amountCurrent',
    'amountGoal',
    'progressPct',
    'state',
  ]);

  const system =
    'You transform public donation campaign data into structured Korean metadata. ' +
    'Output MUST be valid JSON only. No markdown. No commentary.';

  const user =
    'Given this campaign input JSON, classify and summarize it for a Korean donation search UI.\n' +
    'Allowed target values:\n' +
    TARGETS.map((v) => `- ${v}`).join('\n') +
    '\n\nAllowed supportType values:\n' +
    SUPPORT_TYPES.map((v) => `- ${v}`).join('\n') +
    '\n\nHard rules:\n' +
    '- Output MUST be a single JSON object. No markdown, no commentary.\n' +
    '- Do not output keys other than: title, oneLineSummary, target, supportType, category, tags.\n' +
    '- title MUST copy input.titleRaw exactly when input.titleRaw is non-empty.\n' +
    '- oneLineSummary MUST be Korean and about 50 characters or fewer.\n' +
    '- target MUST be exactly one of the allowed target values.\n' +
    '- supportType MUST be exactly one of the allowed supportType values.\n' +
    '- category MUST be the same value as target for backward compatibility.\n' +
    '- tags MUST be 3 to 5 Korean noun-like keywords.\n' +
    '- Never create target/supportType/category values outside the allowed lists.\n' +
    '- Do NOT invent facts not present in input.\n' +
    '- If target is ambiguous, use 기타.\n' +
    '- If supportType is ambiguous, use 기타.\n' +
    'Output schema exactly:\n' +
    '{"title":string,"oneLineSummary":string,"target":string,"supportType":string,"category":string,"tags":string[]}\n' +
    'Input:\n' +
    JSON.stringify(input);

  async function runOnce(temperature) {
    const j = await ollamaChat({
      host,
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      // Ollama JSON mode (best-effort enforcement).
      format: 'json',
      options: { temperature },
      signal,
    });
    const content = j?.message?.content;
    try {
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      return null;
    }
  }

  const parsed = (await runOnce(0.1)) || (await runOnce(0.3));
  return sanitizeRefinedCampaign(parsed, campaign);
}

module.exports = {
  TARGETS,
  SUPPORT_TYPES,
  REFINED_SCHEMA_VERSION,
  fallbackRefinedCampaign,
  sanitizeRefinedCampaign,
  refineCampaignWithOllama,
  ollamaTags,
  ollamaHasModel,
};
