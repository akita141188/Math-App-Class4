import type { Question, QuestionVisual } from '@math-app/shared';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { domains, topics } from './catalog.data';
import { finalizedProblemBlueprints } from './catalog.v2.data';

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function visualHtml(visual?: QuestionVisual): string {
  if (!visual) return '<p class="muted">Không có hình</p>';
  if (visual.type === 'FRACTION_BAR') {
    return `<svg viewBox="0 0 360 100" role="img" aria-label="${escapeHtml(visual.alt)}">${Array.from({ length: visual.equalParts }, (_, index) => `<rect x="${index * (340 / visual.equalParts) + 10}" y="10" width="${340 / visual.equalParts}" height="80" fill="${index < visual.shadedParts ? '#39a98d' : '#fff'}" stroke="#20443b"/>`).join('')}</svg>`;
  }
  if (visual.type === 'FRACTION_CIRCLE') {
    const angle = 360 / visual.equalParts;
    const lines = Array.from({ length: visual.equalParts }, (_, index) => {
      const radians = ((index * angle - 90) * Math.PI) / 180;
      return `<line x1="100" y1="100" x2="${100 + Math.cos(radians) * 80}" y2="${100 + Math.sin(radians) * 80}" stroke="#20443b"/>`;
    }).join('');
    return `<div class="fraction-circle" style="--angle:${visual.shadedParts * angle}deg" role="img" aria-label="${escapeHtml(visual.alt)}"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="#20443b" stroke-width="2"/>${lines}</svg></div>`;
  }
  if (visual.type === 'BAR_CHART') {
    const max = Math.max(...visual.bars.map((bar) => bar.value), 1);
    return `<div class="bars" role="img" aria-label="${escapeHtml(visual.alt)}">${visual.bars.map((bar) => `<div><span style="height:${Math.max(8, (bar.value / max) * 100)}px"></span><b>${escapeHtml(bar.value)}</b><small>${escapeHtml(bar.label)}</small></div>`).join('')}</div>`;
  }
  if (visual.type === 'TABLE')
    return `<table><thead><tr>${visual.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${visual.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `<pre>${escapeHtml(JSON.stringify(visual, null, 2))}</pre>`;
}

function answerText(question: Question): string {
  const expected = question.expectedAnswer;
  if (expected.kind === 'NUMBER')
    return `${expected.value}${expected.unit ? ` ${expected.unit}` : ''}`;
  if (expected.kind === 'FRACTION') return `${expected.numerator}/${expected.denominator}`;
  if (expected.kind === 'TEXT') return expected.accepted.join(' | ');
  if (expected.kind === 'OPTION')
    return (
      question.options?.find((option) => option.id === expected.optionId)?.label ??
      expected.optionId
    );
  if (expected.kind === 'OPTIONS') return expected.optionIds.join(', ');
  if (expected.kind === 'BOOLEAN') return expected.value ? 'Đúng' : 'Sai';
  if (expected.kind === 'ORDER') return expected.itemIds.join(' → ');
  return expected.pairs.map((pair) => `${pair.leftId} → ${pair.rightId}`).join(', ');
}

export function exportReviewHtml(questions: readonly Question[], outputPath: string): void {
  const options = (values: readonly string[]) =>
    [...new Set(values)]
      .sort()
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
      .join('');
  const cards = questions
    .map((question, index) => {
      const domain =
        domains.find((item) => item.id === question.domainId)?.name ?? question.domainId;
      const topic = topics.find((item) => item.id === question.topicId)?.name ?? question.topicId;
      const type =
        finalizedProblemBlueprints.find((item) => item.id === question.problemTypeId)?.name ??
        question.problemTypeId;
      return `<article id="q-${index + 1}" class="card" data-domain="${escapeHtml(question.domainId)}" data-topic="${escapeHtml(question.topicId)}" data-type="${escapeHtml(question.problemTypeId)}" data-difficulty="${question.difficulty}" data-format="${question.format}" data-visual="${question.visual ? 'yes' : 'no'}" data-search="${escapeHtml(`${question.id} ${question.stem}`.toLocaleLowerCase('vi'))}">
      <header><b>${index + 1}. ${escapeHtml(question.id)}</b><a href="#q-${Math.min(questions.length, index + 2)}">Câu sau ↓</a></header>
      <p class="path">${escapeHtml(domain)} → ${escapeHtml(topic)} → ${escapeHtml(type)}</p>
      <p><code>${escapeHtml(question.templateId)}</code> · ${question.difficulty} · ${question.format}</p>
      <h2>${escapeHtml(question.stem)}</h2>${visualHtml(question.visual)}
      ${question.options ? `<ol>${question.options.map((option) => `<li>${escapeHtml(option.id)} — ${escapeHtml(option.label)}</li>`).join('')}</ol>` : ''}
      <dl><dt>Đáp án</dt><dd>${escapeHtml(answerText(question))}</dd><dt>Gợi ý</dt><dd>${question.hints.map((hint) => `${hint.level}. ${escapeHtml(hint.text)}`).join('<br>')}</dd><dt>Giải thích</dt><dd>${escapeHtml(question.explanation)}</dd><dt>Fingerprint</dt><dd><code>${escapeHtml(question.fingerprint)}</code></dd></dl>
    </article>`;
    })
    .join('\n');
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Grade 4 content review</title><style>
  body{margin:0;background:#f4f7f6;color:#173b33;font:15px system-ui}.tools{position:sticky;top:0;z-index:2;padding:12px;background:#fff;border-bottom:1px solid #ccd;display:flex;gap:8px;flex-wrap:wrap}.tools input,.tools select{padding:8px}.count{margin-left:auto}.grid{max-width:1100px;margin:auto;padding:20px}.card{background:#fff;border:1px solid #ccd;border-radius:12px;padding:18px;margin:0 0 18px;box-shadow:0 2px 8px #0001}.card header{display:flex;justify-content:space-between}.path,.muted{color:#59716b}.card svg{display:block;max-width:420px;width:100%;height:auto}.card pre{white-space:pre-wrap;background:#f2f5f4;padding:10px}.card table{border-collapse:collapse}.card th,.card td{border:1px solid #999;padding:6px}.bars{height:140px;display:flex;align-items:flex-end;gap:16px}.bars div{display:grid;text-align:center}.bars span{width:42px;background:#39a98d}.fraction-circle{width:220px;height:220px;border-radius:50%;background:conic-gradient(#39a98d 0 var(--angle),#fff var(--angle) 360deg);position:relative}.fraction-circle svg{position:absolute;inset:10px;width:200px}.hidden{display:none}</style></head><body>
  <div class="tools"><input id="search" placeholder="Tìm ID hoặc nội dung"><select id="domain"><option value="">Mọi domain</option>${options(questions.map((q) => q.domainId))}</select><select id="topic"><option value="">Mọi topic</option>${options(questions.map((q) => q.topicId))}</select><select id="type"><option value="">Mọi problem type</option>${options(questions.map((q) => q.problemTypeId))}</select><select id="difficulty"><option value="">Mọi độ khó</option><option>EASY</option><option>MEDIUM</option><option>HARD</option></select><select id="format"><option value="">Mọi format</option>${options(questions.map((q) => q.format))}</select><select id="visual"><option value="">Có/không visual</option><option value="yes">Có visual</option><option value="no">Không visual</option></select><b class="count" id="count"></b></div>
  <main class="grid">${cards}</main><script>const fields=['domain','topic','type','difficulty','format','visual'];const cards=[...document.querySelectorAll('.card')];function filter(){const text=document.querySelector('#search').value.toLocaleLowerCase('vi');let shown=0;for(const card of cards){const ok=(!text||card.dataset.search.includes(text))&&fields.every(k=>!document.querySelector('#'+k).value||card.dataset[k]===document.querySelector('#'+k).value);card.classList.toggle('hidden',!ok);if(ok)shown++}document.querySelector('#count').textContent=shown+' / '+cards.length}document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',filter));filter()</script></body></html>`;
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf8');
}
