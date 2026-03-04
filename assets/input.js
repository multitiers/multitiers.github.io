let DATA = {};
let CURRENT_TAB = 'rankings';
let CURRENT_KIT = 'overall';
const KIT_MAP = {
    "overall": "",
    "emerald": "emerald.png",
    "emerald_kb": "emerald_kb.png",
    "emerald_oa": "emerald_oa.png",
    "dragon": "dragonhide_kb.png",
    "dragon_oa": "kb_oa.png",
    "wand": "wand.png",
    "diamond": "diamond.png"
};
const REG_MAP = {
    "na": "North America",
    "eu": "Europe",
    "sa": "South America",
    "oc": "Oceania",
    "as": "Asia"
};
const DEV_MAP = { 
    "mk": "Mouse & Keyboard",
    "mb": "Mobile",
    "ct": "Controller",
    "tp": "Touchpad"
};

function getTags(name) {
    const p = DATA.players?.find(x => x.name === name) || {region:"??", device:"??"};
    const rL = REG_MAP[p.region];
    const dL = DEV_MAP[p.device];
    return `<div style="margin-top:5px;">
        <div class="tag-wrap ${rL?'has-hover':''}"><span class="tag reg-${p.region.toLowerCase()}">${p.region.toUpperCase()}</span>${rL?`<div class="tag-popup">${rL}</div>`:''}</div>
        <div class="tag-wrap ${dL?'has-hover':''}"><span class="tag dev-${p.device.toLowerCase()}">${p.device.toUpperCase()}</span>${dL?`<div class="tag-popup">${dL}</div>`:''}</div>
    </div>`;
}

async function load() {
    const currentURL = new URL(window.location.href);
    const r = await fetch(`${currentURL.origin}/stats/rankings.json?v=${Date.now()}`);
    DATA = await r.json();
    let totals = {};
    const PTS = { "ht1":50, "lt1":40, "ht2":30, "lt2":20, "ht3":12, "lt3":8, "ht4":5, "lt4":3, "ht5":2, "lt5":1 };
    for(let k in DATA) if(k!=="players") for(let t in DATA[k]) DATA[k][t].forEach(p => totals[p] = (totals[p]||0) + (PTS[t.replace('R','')]||0));
    DATA["overall"] = totals;
    buildKitBar();
    render("overall");
}

function buildKitBar() {
    const bar = document.getElementById('kitBar'); bar.innerHTML = "";
    Object.keys(KIT_MAP).forEach(k => {
        const btn = document.createElement('button');
        btn.className = `kit-btn ${k==='overall'?'active':''}`;
        btn.innerHTML = (KIT_MAP[k] ? `<img src="/assets/img/${KIT_MAP[k]}" style="width:16px; margin-right:5px;"> ` : "") + k.replace('_', ' ').toUpperCase();
        btn.onclick = () => { if(CURRENT_TAB === 'rankings') { document.querySelectorAll('.kit-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); CURRENT_KIT = k; render(k); }};
        bar.appendChild(btn);
    });
}

function render(kit) {
    if(CURRENT_TAB !== 'rankings') return;
    document.getElementById('viewLabel').innerText = kit.replace('_', ' ').toUpperCase();
    const out = document.getElementById('displayList'); out.innerHTML = "";
    if(kit !== "overall" && (!DATA[kit] || Object.keys(DATA[kit]).length === 0)) {
        out.innerHTML = `<h2 style="font-family:'MultiCraftFont'; color:#444; margin-top:50px;">NO RANKED PLAYERS</h2>`;
        return;
    }
    if(kit === "overall") {
        Object.entries(DATA.overall).sort((a,b)=>b[1]-a[1]).forEach(([name, pts], i) => {
            out.innerHTML += `<div class="tier-card clickable" onclick="openProfile('${name}')"><div style="display:flex; justify-content:space-between; align-items:center;"><div><b style="color:var(--purple); margin-right:15px; font-size:1rem;">#${i+1}</b><span style="font-weight:bold; font-size:1rem;">${name}</span>${getTags(name)}</div><b style="color:var(--gold); font-size:1rem;">${pts} PTS</b></div></div>`;
        });
    } else {
        const grid = document.createElement('div'); grid.style.display="flex"; grid.style.gap="20px"; grid.style.flexWrap="wrap"; grid.style.justifyContent="center";
        ["t1","t2","t3","t4","t5"].forEach(lvl => {
            let col = `<div style="min-width:200px;"><div style="color:var(--purple); border-bottom:1px solid var(--border); margin-bottom:10px; text-align:center; font-family:'MultiCraftFont'; font-size:0.9rem;">${lvl.toUpperCase()}</div>`;
            let has = false;
            for(let t in DATA[kit]) if(t.includes(lvl)) DATA[kit][t].forEach(name => {
                has = true; const isR = t.startsWith('R');
                col += `<div class="tier-card clickable" style="width:200px; padding:12px;" onclick="openProfile('${name}')"><span style="font-size:0.9rem; font-weight:bold;">${name}</span>${getTags(name)}<div style="font-size:0.6rem; color:${isR?'var(--grey)':'var(--gold)'}; margin-top:5px; font-weight:bold;">${isR?'Retired '+t.slice(1):t}</div></div>`;
            });
            if(has) { col += `</div>`; grid.innerHTML += col; }
        });
        out.appendChild(grid);
    }
}

function getTabTitle(tab)
{
    switch(tab)
    {
        case 'hof':
            return 'HALL OF FAME';
        case 'testers':
            return 'TIER TESTERS';
        case 'contributors':
            return 'CONTRIBUTORS';
    }
}

async function switchTab(tab) {
    CURRENT_TAB = tab;
    const out = document.getElementById('displayList'), kb = document.getElementById('kitBar'), lb = document.getElementById('viewLabel');
    out.innerHTML = "";
    if(tab === 'rankings') {
        kb.style.display="flex";
        render(CURRENT_KIT);
    } else {
        kb.style.display="none";
        lb.innerText = getTabTitle(tab);
        const currentURL = new URL(window.location.href);
        const r = await fetch(`${currentURL.origin}/stats/${tab}.json?v=${Date.now()}`);
        const data = await r.json();
        data.forEach(i => {
            switch(tab)
            {
                case 'contributors':
                    out.innerHTML += `<div class="tier-card">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <img style="width:32px; height:32px;" src="/assets/img/contributors/${i.name}.png" />
                            <b style="color:var(--purple); font-family:'MultiCraftFont'; font-size:1rem;">${i.name}</b>
                        </div>
                        <p style="font-size:0.75rem; color:#bbb; margin-top:8px;">${i.description || ''}</p>
                    </div>`;
                    break;
                default:
                    const hasProf = DATA.overall[i.name];
                    out.innerHTML += `<div class="tier-card ${hasProf ? 'clickable' : ''}" ${hasProf?`onclick="openProfile('${i.name}')"`:''}>
                        <b style="color:var(--purple); font-family:'MultiCraftFont'; font-size:1rem;">${i.name}</b>
                        ${i.discord ? `<div style="color:var(--purple); font-size:0.85rem; font-weight:bold; margin-top:5px;">Discord: ${i.discord}</div>`:''}
                        <p style="font-size:0.75rem; color:#bbb; margin-top:8px;">${i.description || ''}</p>
                    </div>`;
                    break;
            }
        });
    }
}

const capitalize = (text) =>
    text ? text[0].toUpperCase() + text.slice(1) : text;

function openProfile(name) {
    if(!DATA.overall[name]) return;
    const sorted = Object.entries(DATA.overall).sort((a,b)=>b[1]-a[1]);
    const rankIdx = sorted.findIndex(x => x[0] === name);
    document.getElementById('pRank').innerText = "RANK #" + (rankIdx + 1);
    document.getElementById('pName').innerText = name;
    document.getElementById('pMeta').innerHTML = getTags(name);
    document.getElementById('pPoints').innerText = DATA.overall[name] + " PTS";
    let grid = "";
    for(let k in DATA) if(k!=="overall" && k!=="players") for(let t in DATA[k]) if(DATA[k][t].includes(name)) {
        const isR = t.startsWith('R');
        const color = isR ? 'var(--grey)' : 'var(--gold)';
        const display = isR ? 'Retired ' + t.substring(1) : t;
        grid += `<div class="p-kit-item">
            <div class="kit-popup" style="border-color:${color}"><span style="color:${color}">${display.toUpperCase()}</span><br><span style="color:#666">${capitalize(k)}</span></div>
            <div class="p-kit-circle" style="border-color:${color}">${KIT_MAP[k]?`<img src="/assets/img/${KIT_MAP[k]}">`:''}</div>
            <div style="font-size:0.6rem; color:${color}; font-weight:bold; margin-top:5px;">${display}</div>
        </div>`;
    }
    document.getElementById('pTiers').innerHTML = grid;
    document.getElementById('profileModal').style.display = 'flex';
}

function handleSearch(val) {
    const pop = document.getElementById('searchPopup');
    if(!val) { pop.style.display = 'none'; return; }
    const matches = Object.keys(DATA.overall).filter(n => n.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
    pop.innerHTML = matches.map(m => `<div class="search-item" onclick="openProfile('${m}'); pop.style.display='none';"><b>${m}</b> <span style="color:var(--purple); font-size:0.5rem;">VIEW PROFILE</span></div>`).join('') || "";
    pop.style.display = matches.length ? 'block' : 'none';
}

function openInfo() { document.getElementById('infoModal').style.display = 'flex'; }
load();
document.addEventListener('click', (e) => { if(!e.target.closest('.search-wrap')) document.getElementById('searchPopup').style.display = 'none'; });

// to avoid inline js
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("nav").addEventListener("click", (e) => {
        const btn = e.target.closest(".nav-link");
        if (!btn) return;

        const tab = btn.dataset.tab;
        if (!tab) return;

        document.querySelectorAll(".nav-link").forEach(el => {
            el.classList.remove("active");
        });

        btn.classList.add("active");
        switchTab(tab);
    });

    document.addEventListener("input", (e) => {
        if (e.target.matches(".search-wrap input")) {
            handleSearch(e.target.value);
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.matches(".info-btn")) {
            openInfo();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.matches(".modal-overlay")) {
            e.target.style.display = "none";
        }

        if (e.target.matches(".modal-content")) {
            e.stopPropagation();
        }
    });
});