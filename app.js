// --- Extracted script block #1 from accessible-event-search_external-json.html ---

  (function(){
    const $ = (id)=>document.getElementById(id);
    const resultsEl = $('results'); const countEl = $('count'); const statusEl = $('status');
    const form = $('searchForm'); const qEl=$('q'), dateEl=$('date'); const clearBtn=$('clear');

    // ===== Data (embedded) =====
    let DATA = [];
    async function init(){
  try{
    const res = await fetch('work-task-test.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    DATA = await res.json();
    countEl.textContent = 'No results yet. Enter filters and press Search.';
    statusEl.textContent = DATA.length ? 'Data file loaded. Press Search to see results.' : 'Data file is empty.';
  } catch(err){
    DATA = [];
    statusEl.textContent = 'Could not load work-task-test.json (' + (err && err.message ? err.message : 'unknown error') + ').';
  }
}

    function monthIndex(name){ return ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(String(name).toLowerCase()); }
    function isoFromDataset(s){ if(!s) return ''; const t=String(s).trim().replace(/^[A-Za-z]+,\s*/, ''); const m=t.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/); if(!m) return ''; const d=parseInt(m[1],10), mi=monthIndex(m[2]), y=parseInt(m[3],10); if(mi<0) return ''; return y+'-'+String(mi+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
    function toHumanDate(iso){ if(!iso) return ''; const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d); try{return new Intl.DateTimeFormat('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(dt);}catch{return dt.toDateString();} }
    function escapeHtml(str){ return String(str).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

    function render(list){
      resultsEl.innerHTML='';
      const total=list.length; countEl.textContent = total + ' result' + (total===1?'':'s');
      if(!total){ const li=document.createElement('li'); li.className='card'; li.innerHTML='<p>No events match your filters.</p>'; resultsEl.appendChild(li); return; }
      list.slice().sort((a,b)=>{ const ai=isoFromDataset(a.date), bi=isoFromDataset(b.date); return ai===bi ? (a.event||'').localeCompare(b.event||'') : ai.localeCompare(bi); })
      .forEach(item=>{ const iso=isoFromDataset(item.date); const li=document.createElement('li'); li.className='card'; li.setAttribute('tabindex','-1'); li.innerHTML=`
        <article>
          <h3 class="event-title">${escapeHtml(item.event||'Untitled')}</h3>
          <dl class="meta">
            <div><dt>Date</dt><dd>${iso?toHumanDate(iso):escapeHtml(item.date||'')}</dd></div>
            <div><dt>Organisation</dt><dd>${escapeHtml(item.organisation||'')}</dd></div>
            <div><dt>Type</dt><dd>${escapeHtml(item.type||'')}</dd></div>
            <div><dt>Location</dt><dd>${escapeHtml(item.location||'')}</dd></div>
            <div><dt>District</dt><dd>${escapeHtml(item.district||'')}</dd></div>
          </dl>
        </article>`; resultsEl.appendChild(li); });
    }

    form.addEventListener('submit', (e)=>{ e.preventDefault(); apply(); });
    // Removed auto-apply on typing/date change
    // Auto-search disabled; results load only after pressing Search
    // qEl.addEventListener('input', apply);
    // dateEl.addEventListener('change', apply);

    clearBtn.addEventListener('click', ()=>{ 
      qEl.value=''; 
      dateEl.value=''; 
      resultsEl.innerHTML=''; 
      countEl.textContent='No results yet. Enter filters and press Search.'; 
      announce('Filters cleared. Enter filters and press Search.'); 
    });

    function apply(){ 
      const q=qEl.value.trim().toLowerCase(); 
      const picked=dateEl.value; 
      // Require at least one filter
      if(!q && !picked){ 
        resultsEl.innerHTML=''; 
        countEl.textContent='Please enter an event name or a date, then press Search.'; 
        announce('Enter at least one filter to search.'); 
        return; 
      }
      const out=DATA.filter(item=>{ 
        const name=(item.event||'').toLowerCase(); 
        const dateMatch=!picked||isoFromDataset(item.date)===picked; 
        return (!q||name.includes(q))&&dateMatch; 
      }); 
      render(out); 
      announce(out.length+' result'+(out.length===1?'':'s')+' found.'); 
    }

    function announce(msg){ if(statusEl) statusEl.textContent = msg; }

    // ===== Mask =====
    const pageMask = $('pageMask'); let center=40, height=30;
    function setMask(on){ pageMask.style.display=on?'block':'none'; if(on) announce('Page mask on. Use Arrow Up/Down to move, +/- to resize, Esc to exit.'); else announce('Page mask off.'); }
    function maskApply(){ pageMask.style.setProperty('--mask-top', center+'vh'); pageMask.style.setProperty('--mask-height', height+'vh'); }
    document.addEventListener('keydown', (e)=>{ const t=e.target, tag=(t&&t.tagName||'').toLowerCase(), typing=tag==='input'||tag==='textarea'||(t&&t.isContentEditable); if(typing) return; if(pageMask.style.display==='block'){ switch(e.key){ case 'ArrowUp': center=Math.max(5,center-2); maskApply(); e.preventDefault(); break; case 'ArrowDown': center=Math.min(95,center+2); maskApply(); e.preventDefault(); break; case '+': case '=': height=Math.min(90,height+2); maskApply(); e.preventDefault(); break; case '-': case '_': height=Math.max(10,height-2); maskApply(); e.preventDefault(); break; case 'Escape': setMask(false); break; } } });

    // ===== TTS =====
    const synth=window.speechSynthesis; const ttsBar=$('ttsBar'), p=$('ttsPlay'), sbtn=$('ttsStop'), prv=$('ttsPrev'), nxt=$('ttsNext'), x=$('ttsClose'), vbtn=$('ttsVolBtn'), vr=$('ttsVol'), rbtn=$('ttsRateBtn'), rr=$('ttsRate');
    let voices=[], queue=[], idx=0, playing=false, paused=false, volume=1, rate=1;
    function loadVoices(){ voices = synth?.getVoices?.()||[]; if(voices.length) return Promise.resolve(); return new Promise(r=>{ const t=setInterval(()=>{ voices=synth.getVoices(); if(voices.length){ clearInterval(t); r(); }},150); setTimeout(()=>{ clearInterval(t); r(); },2000); }); }
    function vpick(){ const prefs=['en-AU','en-GB','en-US']; for(const p of prefs){ const v=voices.find(v=>v.lang&&v.lang.startsWith(p)); if(v) return v; } return voices[0]; }
    function splitSentences(s){ const m=String(s||'').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g); return m&&m.length?m:[]; }
    function tShow(){ ttsBar.hidden=false; } function tHide(){ ttsBar.hidden=true; } function tUpdate(){ p.textContent=(playing&&!paused)?'⏸':'▶'; }
    function cancel(){ try{synth.cancel();}catch{} playing=false; paused=false; tUpdate(); announce('Stopped.'); }
    function speakAt(i){ if(i<0||i>=queue.length){ cancel(); return; } idx=i; const u=new SpeechSynthesisUtterance(queue[idx]); const v=vpick(); if(v) u.voice=v; u.rate=rate; u.volume=volume; u.onend=()=>{ if(playing&&!paused){ if(++idx<queue.length) speakAt(idx); else { playing=false; tUpdate(); announce('Done.'); } } }; u.onerror=()=>{ playing=false; tUpdate(); announce('Speech error.'); }; synth.speak(u); }
    function playPause(){ if(!queue.length) return; if(playing&&!paused){ synth.pause(); paused=true; announce('Paused.'); } else if(playing&&paused){ synth.resume(); paused=false; announce('Resumed.'); } else { playing=true; paused=false; speakAt(idx); announce('Reading…'); } tUpdate(); }
    function prev(){ if(!queue.length) return; cancel(); playing=true; paused=false; speakAt(Math.max(0,idx-1)); tUpdate(); }
    function next(){ if(!queue.length) return; cancel(); playing=true; paused=false; speakAt(Math.min(queue.length-1, idx+1)); tUpdate(); }
    function speak(text){ queue=splitSentences(text); idx=0; if(!queue.length) return; tShow(); playing=true; paused=false; tUpdate(); speakAt(0); }
    function readSummary(){ const h=document.querySelector('h1')?.textContent||'Event Search'; const c=countEl.textContent||''; const f=document.querySelector('#results .event-title')?.textContent||''; return [h,'Use the form to search by event name and date.',c,f?('First result: '+f):''].filter(Boolean).join(' '); }
    $('listenPlayBtn').addEventListener('click', async ()=>{ await loadVoices(); speak(readSummary()); });
    $('listenMainBtn').addEventListener('click', async ()=>{ await loadVoices(); speak(readSummary()); });
    p.addEventListener('click', playPause); sbtn.addEventListener('click', cancel); prv.addEventListener('click', prev); nxt.addEventListener('click', next);
    x.addEventListener('click', ()=>{ cancel(); tHide(); });
    vbtn.addEventListener('click', ()=>{ const on = vr.hasAttribute('hidden'); vr.toggleAttribute('hidden'); vbtn.setAttribute('aria-expanded', String(on)); });
    rbtn.addEventListener('click', ()=>{ const on = rr.hasAttribute('hidden'); rr.toggleAttribute('hidden'); rbtn.setAttribute('aria-expanded', String(on)); });
    vr.addEventListener('input', ()=>{ volume=parseFloat(vr.value||'1'); }); rr.addEventListener('input', ()=>{ rate=parseFloat(rr.value||'1'); });

    // ===== Text Mode popup =====
    const textModal=$('textModal'), textContent=$('textModalContent'), textMinus=$('textMinus'), textPlus=$('textPlus'), textClose=$('textClose'); let tmFs=1.125, lastFocus=null;
    function buildTextBlocks(){ const out=[]; const h=document.querySelector('h1')?.textContent||''; if(h) out.push({tag:'h3', text:h}); const c=countEl.textContent||''; if(c) out.push({tag:'p', text:c}); document.querySelectorAll('#results .card').forEach(card=>{ const title=card.querySelector('.event-title')?.textContent||'Event'; const fields=[]; card.querySelectorAll('dl.meta > div').forEach(div=>{ const k=div.querySelector('dt')?.textContent?.trim(); const v=div.querySelector('dd')?.textContent?.trim(); if(k&&v) fields.push(k+': '+v); }); out.push({tag:'h3', text:title}); if(fields.length) out.push({tag:'p', text:fields.join(' · ')}); }); return out; }
    function openText(){ textContent.innerHTML=''; buildTextBlocks().forEach(b=>{ const n=document.createElement(b.tag); n.textContent=b.text; textContent.appendChild(n); }); tmFs=1.125; textContent.style.setProperty('--tm-fs', tmFs+'rem'); lastFocus=document.activeElement; textModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; textContent.focus(); announce('Text mode opened.'); }
    function closeText(){ textModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; (lastFocus||$('listenMenuBtn'))?.focus(); announce('Text mode closed.'); }
    textMinus.addEventListener('click', ()=>{ tmFs=Math.max(0.9, tmFs-0.1); textContent.style.setProperty('--tm-fs', tmFs+'rem'); });
    textPlus.addEventListener('click', ()=>{ tmFs=Math.min(2.0, tmFs+0.1); textContent.style.setProperty('--tm-fs', tmFs+'rem'); });
    textClose.addEventListener('click', closeText);
    textModal.addEventListener('keydown', (e)=>{ if(textModal.getAttribute('aria-hidden')==='true') return; if(e.key==='Escape'){ e.preventDefault(); closeText(); return; } if(e.key==='Tab'){ const f=textModal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); const list=Array.from(f).filter(n=>!n.hasAttribute('disabled') && n.offsetParent!==null); if(!list.length) return; const first=list[0], last=list[list.length-1]; if(e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); } else if(!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); } } });

    // ===== Listen dropdown & switches =====
    const menuBtn=$('listenMenuBtn'), menu=$('listenMenu'), miText=$('miText'), miMask=$('miMask');
    const swKb=$('swKb'), swListen=$('swListen'), swEnlarge=$('swEnlarge'), swForm=$('swForm');
    let kb=false, clickListen=false, formRead=false;
    function openMenu(){ menu.setAttribute('aria-hidden','false'); menuBtn.setAttribute('aria-expanded','true'); }
    function closeMenu(){ menu.setAttribute('aria-hidden','true'); menuBtn.setAttribute('aria-expanded','false'); }
    menuBtn.addEventListener('click', (e)=>{ e.stopPropagation(); const open = menu.getAttribute('aria-hidden')==='false'; if(open) closeMenu(); else openMenu(); });
    document.addEventListener('click', (e)=>{ if(!menu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(); });
    menu.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeMenu(); menuBtn.focus(); } });
    // BUGFIX: clicking a menu row should trigger the switch exactly once
    menu.addEventListener('click', (e)=>{ const row=e.target.closest('.menu-item'); if(!row) return; const sw=row.querySelector('[role="switch"]'); if(sw && e.target!==sw){ sw.click(); } });

    function setPressed(sw,on){ sw.setAttribute('aria-checked', String(!!on)); }

    function toggleKb(on){ kb=on; setPressed(swKb,on); announce(on?'Keyboard mode on.':'Keyboard mode off.'); }
    function toggleClickListen(on){ clickListen=on; setPressed(swListen,on); announce(on?'Click and listen on.':'Click and listen off.'); }
    function toggleEnlarge(on){ setPressed(swEnlarge,on); if(on) document.documentElement.setAttribute('data-mode','enlarge'); else if(document.documentElement.getAttribute('data-mode')==='enlarge') document.documentElement.removeAttribute('data-mode'); announce(on?'Enlarge text on.':'Enlarge text off.'); }
    function toggleForm(on){ formRead=on; setPressed(swForm,on); if(on){ form.addEventListener('focusin', onFormFocus, true); form.addEventListener('input', onFormInput, true); announce('Form reading on.'); } else { form.removeEventListener('focusin', onFormFocus, true); form.removeEventListener('input', onFormInput, true); announce('Form reading off.'); } }

    swKb.addEventListener('click', ()=> toggleKb(swKb.getAttribute('aria-checked')!=='true'));
    swKb.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggleKb(swKb.getAttribute('aria-checked')!=='true'); } });
    swListen.addEventListener('click', ()=> toggleClickListen(swListen.getAttribute('aria-checked')!=='true'));
    swListen.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggleClickListen(swListen.getAttribute('aria-checked')!=='true'); } });
    swEnlarge.addEventListener('click', ()=> toggleEnlarge(swEnlarge.getAttribute('aria-checked')!=='true'));
    swEnlarge.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggleEnlarge(swEnlarge.getAttribute('aria-checked')!=='true'); } });
    swForm.addEventListener('click', ()=> toggleForm(swForm.getAttribute('aria-checked')!=='true'));
    swForm.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggleForm(swForm.getAttribute('aria-checked')!=='true'); } });

    miText.addEventListener('click', ()=>{ closeMenu(); openText(); });
    miMask.addEventListener('click', ()=>{ const on = document.getElementById('pageMask').style.display!=='block'; setMask(on); maskApply(); });

    resultsEl.addEventListener('click', (e)=>{ if(!clickListen) return; const card=e.target.closest('.card'); if(card){ const title=card.querySelector('.event-title')?.textContent||'Event'; const date=card.querySelector('dd')?.textContent||''; speak([title,date].filter(Boolean).join('. ')); } });

    function labelFor(ctrl){ const id=ctrl.id; if(id){ const lab=document.querySelector('label[for="'+id+'"]'); if(lab) return lab.textContent.trim(); } return ctrl.getAttribute('aria-label') || ctrl.name || ctrl.id || 'Field'; }
    function getDescribedText(ctrl){ const ids=(ctrl.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean); return ids.map(id=>document.getElementById(id)?.textContent||'').filter(Boolean).join(' '); }
    function onFormFocus(e){ if(!formRead) return; const t=e.target; if(!t||!('value' in t)) return; const msg=[labelFor(t), getDescribedText(t) ? ('Hint: '+getDescribedText(t)) : ''].filter(Boolean).join('. '); speak(msg); }
    let inputDebounce; function onFormInput(e){ if(!formRead) return; clearTimeout(inputDebounce); const t=e.target; inputDebounce=setTimeout(()=>{ speak(labelFor(t)+' updated.'); }, 700); }

    init();
  })();

