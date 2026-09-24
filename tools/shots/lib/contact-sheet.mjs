/* Orbit · tools/shots/lib/contact-sheet.mjs
   One page that lays every capture of a run side by side, grouped by scenario and variant, so a change
   can be read across all the sheets it touched at once. Written beside the images; open it directly. */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function contactSheet(manifest){
  const groups=new Map();
  for(const s of manifest.shots){const k=s.scenario+' · '+s.variant;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s);}
  const body=[...groups].map(([k,list])=>`<section><h2>${esc(k)}</h2><div class="row">${list.map(s=>{
    const st=s.state?`${s.state.state} · row ${s.state.row} · ${s.state.score} · t ${s.state.time}s`:'';
    return `<figure><a href="${esc(s.file)}"><img loading="lazy" src="${esc(s.file)}" alt="${esc(s.name)}"></a><figcaption><b>${esc(s.name)}</b><br>${esc(st)}${s.note?'<br>'+esc(s.note):''}</figcaption></figure>`;
  }).join('')}</div></section>`).join('');
  const fails=manifest.failures.length?`<section class="fail"><h2>Page errors</h2>${manifest.failures.map(f=>`<h3>${esc(f.label)}</h3><pre>${esc(f.errors.join('\n\n'))}</pre>`).join('')}</section>`:'';
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orbit shots</title>
<style>body{margin:0;padding:16px;background:#111;color:#ddd;font:13px/1.4 system-ui,sans-serif}h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:24px 0 8px;color:#fff}
.row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}figure{margin:0;flex:none}img{display:block;height:420px;width:auto;border:1px solid #333;background:#000}
figcaption{max-width:260px;margin-top:4px;color:#aaa}figcaption b{color:#eee}.fail{color:#f99}pre{white-space:pre-wrap;background:#200;padding:8px}</style>
<h1>Orbit shots</h1><div>${esc(manifest.taken)} · ${manifest.shots.length} captures${manifest.failures.length?` · <span style="color:#f99">${manifest.failures.length} with errors</span>`:''}</div>${fails}${body}`;
}
