const API_BASE = 'http://localhost:8080/api';

const statusEl=document.getElementById('status');
const usernameEl=document.getElementById('username');
const passwordEl=document.getElementById('password');
const profilesSection=document.getElementById('profilesSection');
const profilesSelect=document.getElementById('profilesSelect');
const profilePreview=document.getElementById('profilePreview');
const autofillBtn=document.getElementById('autofill');

function setStatus(s){ statusEl.innerText='Status: '+s; }

async function savedToken(){ const d=await chrome.storage.local.get(['token']); return d.token; }
async function saveToken(t){ await chrome.storage.local.set({token:t}); }

async function apiFetch(path, opts = {}) {
  const t = await savedToken();
  const headers = { ...(opts.headers||{}) };
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (t) headers['Authorization'] = 'Bearer ' + t;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  let data = null;
  try { data = await res.json(); } catch (_) { /* ignore */ }
  if (!res.ok) {
    const msg = data ? JSON.stringify(data) : res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

async function login(){
  const u=usernameEl.value.trim(); const p=passwordEl.value.trim();
  if(!u||!p){ setStatus('enter username & password'); return; }
  setStatus('logging in...');
  try{
    const data = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({username:u,password:p}) });
    if(data.token){
      await saveToken(data.token);
      setStatus('logged in');
      showProfilesSection();
      fetchProfiles();
    } else {
      setStatus('login failed: '+JSON.stringify(data));
    }
  }catch(e){ console.error(e); setStatus('error: '+e.message); }
}

async function register(){
  const u=usernameEl.value.trim(); const p=passwordEl.value.trim();
  if(!u||!p){ setStatus('enter username & password'); return; }
  setStatus('registering...');
  try{
    const data = await apiFetch('/auth/register', { method:'POST', body: JSON.stringify({username:u,password:p}) });
    if(data.token){
      await saveToken(data.token);
      setStatus('registered & logged in');
      showProfilesSection();
      fetchProfiles();
    } else {
      setStatus('register failed: '+JSON.stringify(data));
    }
  }catch(e){ console.error(e); setStatus('error: '+e.message); }
}

function showProfilesSection(){ profilesSection.style.display='block'; }

async function fetchProfiles(){
  const t = await savedToken();
  if(!t){ setStatus('not logged in'); return; }
  setStatus('fetching profiles...');

  try{
    let list;
    try {
      // Try list endpoint (if your backend supports it)
      list = await apiFetch('/profiles');
      if (!Array.isArray(list)) throw new Error('not an array');
    } catch (e) {
      // Fall back to single current profile
      const current = await apiFetch('/profiles/current');
      list = current ? [current] : [];
    }

    profilesSelect.innerHTML='';
    for (const p of list) {
      const opt=document.createElement('option');
      opt.value=p.id;
      opt.text=(p.name ?? '(no name)') + (p.email ? (' — '+p.email) : '');
      profilesSelect.appendChild(opt);
    }

    setStatus('profiles loaded: '+list.length);
    profilePreview.style.display='block';
    autofillBtn.style.display='block';
    if(list.length>0) profilePreview.innerText=JSON.stringify(list[0],null,2);

    profilesSelect.onchange=()=>{
      const sel=profilesSelect.value;
      const obj=list.find(x=>String(x.id)===String(sel));
      profilePreview.innerText=JSON.stringify(obj,null,2);
    };
  }catch(e){ console.error(e); setStatus('error fetching profiles: '+e.message); }
}

autofillBtn.addEventListener('click', async ()=>{
  const t=await savedToken();
  if(!t){ setStatus('not logged in'); return; }
  const sel=profilesSelect.value;
  if(!sel){ setStatus('no profile selected'); return; }

  // Always refresh the selected profile (handles updates)
  let list;
  try {
    list = await apiFetch('/profiles').catch(async () => {
      const current = await apiFetch('/profiles/current');
      return current ? [current] : [];
    });
  } catch (e) {
    setStatus('could not refresh profile: '+e.message);
    return;
  }

  const profile=list.find(p=>String(p.id)===String(sel)) || list[0];
  if(!profile){ setStatus('profile not found'); return; }

  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab||!tab.id){ setStatus('no active tab'); return; }

  chrome.scripting.executeScript({
    target:{tabId:tab.id},
    func:(p)=>{
      const setIf=(selectors,value)=>{
        if(!value) return false;
        for(const s of selectors){
          try{
            const el=document.querySelector(s);
            if(el){
              el.focus();
              if(el.tagName==='INPUT' || el.tagName==='TEXTAREA') el.value=value;
              else el.textContent=value;
              el.dispatchEvent(new Event('input',{bubbles:true}));
              return true;
            }
          }catch(_){}
        }
        return false;
      };
      setIf(['input[name*=name]','input[id*=name]','input[placeholder*=Name]'], p.name);
      setIf(['input[name*=email]','input[type=email]'], p.email);
      setIf(['input[name*=phone]','input[type=tel]'], p.phone);
      setIf(['input[name*=location]','input[id*=location]','input[placeholder*=Location]'], p.location);
      if(p.links){
        setIf(['input[name*=linkedin]','input[placeholder*=LinkedIn]'], p.links.linkedin||'');
        setIf(['input[name*=github]','input[placeholder*=GitHub]'], p.links.github||'');
      }
      alert('JobBot: autofill complete — please review and submit.');
    },
    args:[profile]
  });
  setStatus('Autofill attempted — check page');
});

document.addEventListener('DOMContentLoaded', async ()=>{
  document.getElementById('login').addEventListener('click', login);
  document.getElementById('register').addEventListener('click', register);
  document.getElementById('fetchProfiles').addEventListener('click', fetchProfiles);
  const t = await savedToken();
  if(t){
    setStatus('already logged in');
    showProfilesSection();
    fetchProfiles();
  }
});
