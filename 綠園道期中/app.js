// ===== AUTO OPEN ADMIN (launched from launch_admin.html) =====
if (sessionStorage.getItem('openAdmin') === '1') {
  sessionStorage.removeItem('openAdmin');
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const adminLink = document.querySelector('.admin-link');
      if (adminLink) showSection('admin', adminLink);
    }, 1400);
  });
}

// ===== DATA =====
const STAKEHOLDERS = [
  { icon:'🏘️', title:'在地居民', sub:'周邊住戶・社區發展協會・長期居住者', concerns:['生活品質','噪音','停車','治安','日常便利'], sentiment:62, color:'#4ade80' },
  { icon:'🏪', title:'商業使用者', sub:'店家・攤販・商圈組織', concerns:['人流','停車可及性','商機','活動帶動'], sentiment:74, color:'#fbbf24' },
  { icon:'🚗', title:'通勤交通使用者', sub:'機車族・汽車族・公車族・步行者', concerns:['動線安全','通行效率','轉乘便利'], sentiment:38, color:'#f87171' },
  { icon:'🧳', title:'遊客與活動參與者', sub:'外地旅客・假日休閒族群', concerns:['景觀品質','文化特色','休憩設施'], sentiment:81, color:'#60a5fa' },
  { icon:'🏛️', title:'政府與專業單位', sub:'都市設計・景觀設計師・交通規劃師', concerns:['政策可行性','長期維護','城市發展'], sentiment:55, color:'#2dd4bf' },
  { icon:'📋', title:'現場調查', sub:'立體綠廊民意投票・課堂現場參與者', concerns:['立體綠廊','理解程度','方案支持度','意見回饋'], sentiment:60, color:'#a78bfa', isLive:true }
];

const TOPICS = [
  { name:'停車問題', count:287, pct:95 },
  { name:'景觀綠化', count:241, pct:80 },
  { name:'交通動線', count:198, pct:66 },
  { name:'休憩空間', count:175, pct:58 },
  { name:'商業活化', count:143, pct:48 },
  { name:'文化特色', count:112, pct:37 },
  { name:'安全疑慮', count:89, pct:30 },
  { name:'噪音問題', count:67, pct:22 }
];

const WORDS = [
  {w:'綠園道',s:2.4,c:'#4ade80'},{w:'停車',s:2.0,c:'#f87171'},{w:'景觀',s:1.8,c:'#4ade80'},
  {w:'行道樹',s:1.6,c:'#4ade80'},{w:'交通',s:1.5,c:'#fbbf24'},{w:'休憩',s:1.4,c:'#60a5fa'},
  {w:'商圈',s:1.3,c:'#fbbf24'},{w:'步道',s:1.2,c:'#4ade80'},{w:'噪音',s:1.0,c:'#f87171'},
  {w:'文化',s:1.0,c:'#2dd4bf'},{w:'廣場',s:0.9,c:'#60a5fa'},{w:'自行車',s:0.9,c:'#4ade80'},
  {w:'安全',s:0.8,c:'#fbbf24'},{w:'設施',s:0.8,c:'#60a5fa'},{w:'活動空間',s:0.7,c:'#4ade80'}
];

const STRATEGIES = [
  ['擔心停車不足','→','增設周邊停車導引'],
  ['希望更多綠蔭','→','強化喬木配置'],
  ['期待活動空間','→','規劃彈性廣場'],
  ['交通動線混亂','→','分流設計與標示'],
  ['商業冷清疑慮','→','引入市集活動節點'],
  ['安全感不足','→','增設照明與監控']
];

const MATRIX_ISSUES = [
  { name:'景觀綠化', x:30, y:25, size:52, color:'rgba(74,222,128,0.7)' },
  { name:'休憩空間', x:38, y:35, size:44, color:'rgba(96,165,250,0.7)' },
  { name:'文化特色', x:25, y:40, size:36, color:'rgba(45,212,191,0.7)' },
  { name:'停車問題', x:72, y:30, size:58, color:'rgba(251,191,36,0.7)' },
  { name:'交通動線', x:78, y:45, size:50, color:'rgba(248,113,113,0.7)' },
  { name:'噪音問題', x:68, y:65, size:34, color:'rgba(248,113,113,0.5)' },
  { name:'商業活化', x:55, y:35, size:40, color:'rgba(251,191,36,0.6)' }
];

const SOURCES = ['PTT','Dcard','Facebook','新聞媒體','YouTube'];
const SENTIMENTS = ['positive','negative','neutral'];
const SENT_EMOJI = { positive:'😊', negative:'😠', neutral:'😐' };

const SAMPLE_TEXTS = {
  positive:[
    '台南綠園道規劃真的很用心，期待完工後散步的好去處！',
    '綠化政策很棒，希望多種大樹提供遮蔭，夏天走起來舒服',
    '支持綠園道計畫，讓台南市區更有活力',
    '設計感十足，感覺會變成台南新景點',
    '終於有個好走的步道，自行車族也可以用！'
  ],
  negative:[
    '停車位減少太多了，附近居民根本找不到地方停車',
    '施工期間噪音嚴重影響生活品質，希望盡快完工',
    '擔心完工後人潮帶來更多噪音和垃圾問題',
    '交通動線設計有問題，機車族怎麼走？',
    '這樣下去商家生意會大受影響'
  ],
  neutral:[
    '想了解綠園道完工後的維護計畫是什麼',
    '請問步道寬度是多少？可以放共享單車嗎',
    '活動空間規劃了哪些設施？有沒有無障礙設計',
    '新聞說預計幾月完工？有最新進度嗎',
    '希望公聽會可以多辦幾場讓市民參與'
  ]
};

// ===== STATE =====
let feedData = [];
let feedFilter = 'all';
let charts = {};
let adminLoggedIn = false;
let tableData = [];
let refreshTimer = null;

// ===== PERSISTENT SENTIMENT STATE (只增不減) =====
let sentimentState = {
  pos: Math.floor(Math.random() * 100 + 350),
  neg: Math.floor(Math.random() * 80 + 120),
  neu: Math.floor(Math.random() * 60 + 80)
};

// ===== LIVE SURVEY DATA (來自 Streamlit 現場調查) =====
let surveyData = {
  url: 'https://voting-app-6x9yhhfqyhfjnncugyuvab.streamlit.app/',
  total: 1,
  supportScore: 3,
  opposeScore: 2,
  avgUnderstanding: 2.0,
  supportPct: 60,
  opposePct: 40,
  comments: ['我覺得你好棒!!'],
  lastFetch: new Date().toLocaleString('zh-TW')
};

function updateSurveyUI() {
  const el = document.getElementById('survey-panel');
  if (!el) return;
  const d = surveyData;
  el.innerHTML = `
    <div class="survey-stats">
      <div class="survey-stat"><span class="snum">${d.total}</span><span class="slabel">參與人數</span></div>
      <div class="survey-stat pro"><span class="snum">${d.supportPct}%</span><span class="slabel">支持立體綠廊</span></div>
      <div class="survey-stat con"><span class="snum">${d.opposePct}%</span><span class="slabel">不支持</span></div>
      <div class="survey-stat"><span class="snum">${d.avgUnderstanding}/5</span><span class="slabel">平均理解度</span></div>
    </div>
    <div class="survey-bar-wrap">
      <div class="survey-bar-pro" style="width:${d.supportPct}%">支持 ${d.supportPct}%</div>
      <div class="survey-bar-con" style="width:${d.opposePct}%">反對 ${d.opposePct}%</div>
    </div>
    <div class="survey-comments">
      <strong>最新意見：</strong>
      ${d.comments.length ? d.comments.slice(-3).reverse().map(c=>`<span class="survey-comment">${c}</span>`).join('') : '<span style="color:var(--text3)">暫無意見</span>'}
    </div>
    <div class="survey-footer">
      <span class="${d._live ? 'live-status' : 'offline-status'}">${d._live ? '🟢 即時同步中' : '🟡 使用快取資料'}</span>
      <span>更新：${d.lastFetch}</span>
      <a href="${d.url}" target="_blank" class="survey-link">🗳️ 開啟投票</a>
    </div>
  `;
}

// ===== FETCH LIVE SURVEY DATA FROM CLOUD BRIDGE =====
const BRIDGE_URL = 'https://kvdb.io/QGYojw97rm84rCJHb9m676/votes';
let surveyPollTimer = null;

async function fetchSurveyData() {
  try {
    const res = await fetch(BRIDGE_URL, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();

    // Update surveyData with live values
    if (json.total !== undefined) {
      // 檢查是否有新的意見填寫
      const prevTotal = surveyData.total || 0;
      if (json.total > prevTotal && json.records) {
        const newCount = json.total - prevTotal;
        const newRecords = json.records.slice(-newCount);
        
        newRecords.forEach(r => {
          let sent = 'neutral';
          if (r['支持立體綠廊'] > r['不支持立體綠廊']) sent = 'positive';
          if (r['支持立體綠廊'] < r['不支持立體綠廊']) sent = 'negative';
          
          const newRow = {
            time: new Date().toLocaleString('zh-TW'),
            source: '現場調查',
            stakeholder: '現場參與者',
            text: r['意見'] || '無文字意見 (僅給出評分)',
            sentiment: sent,
            topic: '現場回饋',
            count: r['支持立體綠廊'] + r['不支持立體綠廊']
          };
          
          // 加入到後台表格
          tableData.unshift(newRow);
          if (tableData.length > 150) tableData.pop();
          
          // 加入到前台即時串流
          feedData.unshift({
            ...newRow,
            id: Date.now() + Math.random(),
            time: new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
          });
          if (feedData.length > 50) feedData.pop();
        });
        
        // 重新渲染畫面
        if (adminLoggedIn) renderTable(tableData);
        renderFeed();
      }

      surveyData = {
        ...surveyData,
        total: json.total,
        supportScore: json.supportScore || 0,
        opposeScore: json.opposeScore || 0,
        avgUnderstanding: json.avgUnderstanding || 0,
        supportPct: json.supportPct || 0,
        opposePct: json.opposePct || 0,
        comments: json.comments || [],
        lastFetch: new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
        _live: true
      };
      // Update 現場調查 stakeholder sentiment
      const sh = STAKEHOLDERS.find(s => s.isLive);
      if (sh) sh.sentiment = json.supportPct || 60;
      updateSurveyUI();
      // Flash the survey panel
      const el = document.getElementById('survey-panel');
      if (el) { el.style.transition='background 0.5s'; el.style.background='rgba(167,139,250,0.12)'; setTimeout(()=>el.style.background='',600); }
    }
  } catch (e) {
    // Bridge server not running — keep existing data, mark offline
    surveyData._live = false;
    surveyData.lastFetch = new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' }) + ' (橋接離線)';
    updateSurveyUI();
  }
}

function startSurveyPolling() {
  fetchSurveyData(); // immediate first fetch
  surveyPollTimer = setInterval(fetchSurveyData, 30000); // every 30 sec
}


// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showLoading(true);
  setTimeout(() => {
    initData();
    renderStakeholders();
    renderWordCloud();
    renderStrategies();
    renderMatrix();
    initCharts();
    startLiveFeed();
    startTicker();
    animateHeroStats();
    showLoading(false);
    startAutoRefresh();
    startSurveyPolling(); // 啟動現場調查即時同步
  }, 1200);
});

function showLoading(v) {
  document.getElementById('loading').classList.toggle('show', v);
}

function showSection(id, el) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('section-' + id).classList.add('active');
  if (el) el.classList.add('active');
  // scroll past hero for non-dashboard
  if (id !== 'dashboard') {
    document.querySelector('.main-container').scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== SIMULATED DATA =====
function genSentimentData() {
  // 每次刷新累加新增量，總聲量只增不減
  sentimentState.pos += Math.floor(Math.random() * 30 + 5);
  sentimentState.neg += Math.floor(Math.random() * 15 + 2);
  sentimentState.neu += Math.floor(Math.random() * 12 + 2);
  const { pos, neg, neu } = sentimentState;
  return { pos, neg, neu, total: pos + neg + neu };
}

function initData() {
  const d = genSentimentData();
  document.getElementById('kpi-positive').textContent = d.pos;
  document.getElementById('kpi-negative').textContent = d.neg;
  document.getElementById('kpi-neutral').textContent = d.neu;
  document.getElementById('kpi-total').textContent = d.total;
  document.getElementById('kpi-positive-trend').textContent = '↑ +' + Math.floor(Math.random()*15+5) + '%';
  document.getElementById('kpi-negative-trend').textContent = '↓ -' + Math.floor(Math.random()*10+2) + '%';
  document.getElementById('kpi-neutral-trend').textContent = '→ ' + Math.floor(Math.random()*5) + '%';
  document.getElementById('kpi-total-trend').textContent = '↑ +' + Math.floor(Math.random()*12+3) + '%';

  document.getElementById('hero-total').textContent = d.total.toLocaleString();
  document.getElementById('hero-positive').textContent = Math.round(d.pos / d.total * 100) + '%';
  document.getElementById('hero-negative').textContent = Math.round(d.neg / d.total * 100) + '%';
  document.getElementById('hero-update').textContent = new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' });

  renderTopics();
  generateTableData();
  updateScores(d);
  updateSurveyUI();

  // Admin KPI
  document.getElementById('adm-today').textContent = Math.floor(Math.random()*80+40);
  document.getElementById('adm-alerts').textContent = Math.floor(Math.random()*3);
  document.getElementById('adm-last').textContent = new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit' });
}

function refreshData() {
  showLoading(true);
  setTimeout(() => {
    initData();
    updateCharts();
    showLoading(false);
    showToast('✅ 數據已更新！');
    resetCountdown();
  }, 800);
}

function updateTimeRange() { refreshData(); }

// ===== PRO/CON SCORES =====
function updateScores(d) {
  if (!d) { d = genSentimentData(); }
  const proScore = Math.round((d.pos / d.total) * 100);
  const conScore = Math.round((d.neg / d.total) * 100);
  const proPct = proScore;
  const conPct = conScore;

  const proEl = document.getElementById('score-pro');
  const conEl = document.getElementById('score-con');
  if (!proEl) return;

  // Animate score numbers
  animateNum(proEl, proScore, '%');
  animateNum(conEl, conScore, '%');
  document.getElementById('score-pro-bar').style.width = proPct + '%';
  document.getElementById('score-con-bar').style.width = conPct + '%';
  document.getElementById('score-pro-sub').textContent = d.pos + ' 則意見支持';
  document.getElementById('score-con-sub').textContent = d.neg + ' 則意見反對';
}

function animateNum(el, target, suffix) {
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (suffix || '');
    if (cur >= target) clearInterval(t);
  }, 30);
}

// ===== TOPIC LIST =====
function renderTopics() {
  const el = document.getElementById('topic-list');
  el.innerHTML = TOPICS.map((t, i) => `
    <div class="topic-item">
      <div class="topic-rank">${i + 1}</div>
      <div class="topic-name">${t.name}</div>
      <div class="topic-bar-wrap"><div class="topic-bar" style="width:${t.pct}%"></div></div>
      <div class="topic-count">${t.count}</div>
    </div>`).join('');
}

// ===== LIVE FEED =====
function startLiveFeed() {
  for (let i = 0; i < 8; i++) addFeedItem(false);
  renderFeed();
  setInterval(() => {
    addFeedItem(true);
    renderFeed();
  }, 4000);
}

function addFeedItem(animate) {
  const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const sent = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];
  const texts = SAMPLE_TEXTS[sent];
  const text = texts[Math.floor(Math.random() * texts.length)];
  const sh = STAKEHOLDERS[Math.floor(Math.random() * STAKEHOLDERS.length)];
  const item = {
    id: Date.now() + Math.random(),
    source: src, sentiment: sent, text,
    stakeholder: sh.title,
    time: new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
    isNew: animate
  };
  feedData.unshift(item);
  if (feedData.length > 50) feedData.pop();
  tableData.unshift({ ...item, topic: TOPICS[Math.floor(Math.random() * TOPICS.length)].name, count: Math.floor(Math.random() * 50 + 1) });
  if (tableData.length > 100) tableData.pop();
}

function renderFeed() {
  const el = document.getElementById('live-feed');
  const filtered = feedFilter === 'all' ? feedData : feedData.filter(d => d.sentiment === feedFilter);
  el.innerHTML = filtered.slice(0, 20).map(d => `
    <div class="feed-item ${d.sentiment}">
      <span class="feed-sentiment">${SENT_EMOJI[d.sentiment]}</span>
      <span class="feed-source">${d.source}</span>
      <span class="feed-text">${d.text}</span>
      <span class="feed-meta">${d.time}</span>
    </div>`).join('');
}

function filterFeed(type, btn) {
  feedFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
}

// ===== TICKER =====
function startTicker() {
  const items = [
    '🟢 PTT：「綠園道景觀設計很棒！期待完工」',
    '🔴 Facebook：「停車問題沒解決，反對施工」',
    '🟡 Dcard：「希望多一些休憩設施給年輕人」',
    '🟢 新聞：台南市長出席綠園道說明會，獲居民好評',
    '🔴 PTT：「施工噪音影響附近居民生活」',
    '🟡 YouTube：留言詢問完工時間與維護計畫',
    '🟢 Dcard：「自行車道設計很棒，支持！」',
    '🔴 Facebook：「商家反映人潮減少，希望補償」'
  ];
  document.getElementById('ticker-content').textContent = items.join('　　　　');
}

// ===== STAKEHOLDERS =====
function renderStakeholders() {
  document.getElementById('stakeholder-grid').innerHTML = STAKEHOLDERS.map(s => `
    <div class="stakeholder-card${s.isLive ? ' live-card' : ''}">
      <div class="sh-icon">${s.icon} ${s.isLive ? '<span class="live-badge">LIVE</span>' : ''}</div>
      <div class="sh-title">${s.title}</div>
      <div class="sh-sub">${s.sub}</div>
      <div class="sh-concerns">${s.concerns.map(c => `<span class="concern-tag">${c}</span>`).join('')}</div>
      <div class="sh-sentiment-bar"><div class="sh-sentiment-fill" style="width:${s.sentiment}%;background:${s.color}"></div></div>
      <div class="sh-sentiment-label">正面情緒 ${s.sentiment}%${s.isLive ? ' <small>（現場實測）</small>' : ''}</div>
      ${s.isLive ? `<a href="https://voting-app-6x9yhhfqyhfjnncugyuvab.streamlit.app/" target="_blank" class="sh-live-link">🗳️ 前往投票</a>` : ''}
    </div>`).join('');
}

// ===== WORD CLOUD =====
function renderWordCloud() {
  document.getElementById('word-cloud').innerHTML = WORDS.map(w => `
    <span class="word-tag" style="font-size:${w.s * 0.6 + 0.7}rem;background:${w.c}22;color:${w.c};border:1px solid ${w.c}44">${w.w}</span>`).join('');
}

// ===== STRATEGIES =====
function renderStrategies() {
  document.getElementById('strategy-table').innerHTML = STRATEGIES.map(([a, arrow, b]) => `
    <div class="strategy-row">
      <span style="color:var(--text2)">${a}</span>
      <span class="strategy-arrow">${arrow}</span>
      <span style="color:var(--green)">${b}</span>
    </div>`).join('');
}

// ===== MATRIX =====
function renderMatrix() {
  const el = document.getElementById('issue-matrix');
  el.innerHTML += '<div class="crosshair-h"></div><div class="crosshair-v"></div>';
  MATRIX_ISSUES.forEach(issue => {
    const bub = document.createElement('div');
    bub.className = 'matrix-bubble';
    bub.style.cssText = `left:${issue.x}%;top:${issue.y}%;width:${issue.size}px;height:${issue.size}px;background:${issue.color};`;
    bub.innerHTML = `<span>${issue.name}</span>${issue.name.charAt(0)}`;
    el.appendChild(bub);
  });
}

// ===== ANIMATE HERO =====
function animateHeroStats() {
  const el = document.getElementById('hero-total');
  const target = parseInt(el.textContent.replace(/,/g, '')) || 856;
  let cur = 0;
  const step = Math.ceil(target / 40);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur.toLocaleString();
    if (cur >= target) clearInterval(t);
  }, 30);
}

// ===== CHARTS =====
const CHART_DEFAULTS = {
  color: '#e2e8f0',
  gridColor: 'rgba(255,255,255,0.05)',
  font: "'Noto Sans TC', sans-serif"
};

function mkLabels24h() {
  return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
}

function rnd(min, max, n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min) + min));
}

function initCharts() {
  Chart.defaults.color = CHART_DEFAULTS.color;
  Chart.defaults.font.family = CHART_DEFAULTS.font;

  // Trend Chart
  charts.trend = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: mkLabels24h(),
      datasets: [
        { label:'正面', data: rnd(10,40,24), borderColor:'#4ade80', backgroundColor:'rgba(74,222,128,0.08)', tension:0.4, fill:true, pointRadius:2 },
        { label:'負面', data: rnd(5,25,24), borderColor:'#f87171', backgroundColor:'rgba(248,113,113,0.06)', tension:0.4, fill:true, pointRadius:2 },
        { label:'中性', data: rnd(5,20,24), borderColor:'#64748b', backgroundColor:'rgba(100,116,139,0.05)', tension:0.4, fill:true, pointRadius:2 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ maxTicksLimit:8, font:{size:10} } },
        y:{ grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10} } }
      }
    }
  });

  // Donut
  charts.donut = new Chart(document.getElementById('sentimentDonut'), {
    type: 'doughnut',
    data: {
      labels: ['正面','負面','中性'],
      datasets: [{ data:[52,24,24], backgroundColor:['#4ade80','#f87171','#475569'], borderWidth:0, hoverOffset:8 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, padding:12 } } }
    }
  });

  // Source Bar
  charts.sourceBar = new Chart(document.getElementById('sourceBar'), {
    type: 'bar',
    data: {
      labels: ['PTT','Dcard','Facebook','新聞媒體','YouTube'],
      datasets: [
        { label:'正面', data: rnd(30,120,5), backgroundColor:'rgba(74,222,128,0.7)', borderRadius:4 },
        { label:'負面', data: rnd(20,80,5), backgroundColor:'rgba(248,113,113,0.7)', borderRadius:4 },
        { label:'中性', data: rnd(15,60,5), backgroundColor:'rgba(100,116,139,0.5)', borderRadius:4 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, padding:10 } } },
      scales:{
        x:{ stacked:true, grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10} } },
        y:{ stacked:true, grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10} } }
      }
    }
  });

  // Radar
  charts.radar = new Chart(document.getElementById('dimensionRadar'), {
    type: 'radar',
    data: {
      labels: ['功能需求','空間感受','社會影響','經濟效益','交通影響'],
      datasets: [
        { label:'正面', data:[82,74,65,58,42], backgroundColor:'rgba(74,222,128,0.15)', borderColor:'#4ade80', pointBackgroundColor:'#4ade80', pointRadius:3 },
        { label:'負面', data:[35,28,40,32,72], backgroundColor:'rgba(248,113,113,0.12)', borderColor:'#f87171', pointBackgroundColor:'#f87171', pointRadius:3 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, padding:10 } } },
      scales:{ r:{ grid:{ color:'rgba(255,255,255,0.06)' }, pointLabels:{ font:{size:10} }, ticks:{ display:false }, angleLines:{ color:'rgba(255,255,255,0.05)' } } }
    }
  });

  // Admin 7-day trend
  const days7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return `${d.getMonth()+1}/${d.getDate()}`; });
  charts.adminTrend = new Chart(document.getElementById('adminTrendChart'), {
    type: 'bar',
    data: {
      labels: days7,
      datasets: [
        { label:'正面', data: rnd(50,200,7), backgroundColor:'rgba(74,222,128,0.7)', borderRadius:4 },
        { label:'負面', data: rnd(30,120,7), backgroundColor:'rgba(248,113,113,0.6)', borderRadius:4 },
        { label:'中性', data: rnd(20,80,7), backgroundColor:'rgba(100,116,139,0.5)', borderRadius:4 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, padding:10 } } },
      scales:{
        x:{ stacked:true, grid:{ color:CHART_DEFAULTS.gridColor } },
        y:{ stacked:true, grid:{ color:CHART_DEFAULTS.gridColor } }
      }
    }
  });

  // Admin source pie
  charts.adminPie = new Chart(document.getElementById('adminSourcePie'), {
    type: 'pie',
    data: {
      labels: ['PTT','Dcard','Facebook','新聞媒體','YouTube'],
      datasets: [{ data:[22,18,35,15,10], backgroundColor:['#4ade80','#60a5fa','#f87171','#fbbf24','#2dd4bf'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, padding:8 } } } }
  });

  // Pro/Con by Stakeholder
  const proConEl = document.getElementById('proConChart');
  if (proConEl) {
    charts.proCon = new Chart(proConEl, {
      type: 'bar',
      data: {
        labels: STAKEHOLDERS.map(s => s.title),
        datasets: [
          { label:'贊成', data: STAKEHOLDERS.map(() => Math.floor(Math.random()*40+40)), backgroundColor:'rgba(74,222,128,0.75)', borderRadius:4 },
          { label:'反對', data: STAKEHOLDERS.map(() => Math.floor(Math.random()*30+15)), backgroundColor:'rgba(248,113,113,0.7)', borderRadius:4 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, padding:10 } } },
        scales:{
          x:{ grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10} } },
          y:{ grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10}, callback: v => v+'%' }, max:100 }
        }
      }
    });
  }

  // Stakeholder bar
  charts.shBar = new Chart(document.getElementById('stakeholderBar'), {
    type: 'bar',
    data: {
      labels: ['停車','景觀綠化','交通動線','休憩空間','商業活化','文化特色'],
      datasets: STAKEHOLDERS.map(s => ({
        label: s.title,
        data: rnd(20,100,6),
        backgroundColor: s.color + 'bb',
        borderRadius: 4
      }))
    },
    options: {
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:9}, padding:8 } } },
      scales:{
        x:{ grid:{ color:CHART_DEFAULTS.gridColor } },
        y:{ grid:{ color:CHART_DEFAULTS.gridColor }, ticks:{ font:{size:10} } }
      }
    }
  });

  // Stakeholder pie
  charts.shPie = new Chart(document.getElementById('stakeholderPie'), {
    type: 'doughnut',
    data: {
      labels: STAKEHOLDERS.map(s => s.title),
      datasets: [{ data:[30,22,25,13,10], backgroundColor: STAKEHOLDERS.map(s=>s.color), borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:9}, padding:8 } } } }
  });
}

function updateCharts() {
  if (charts.trend) {
    charts.trend.data.datasets.forEach(ds => { ds.data = rnd(5,45,24); });
    charts.trend.update('active');
  }
  if (charts.donut) {
    const p=Math.floor(Math.random()*20+40), n=Math.floor(Math.random()*15+15), nu=100-p-n;
    charts.donut.data.datasets[0].data = [p,n,nu];
    charts.donut.update('active');
  }
  if (charts.sourceBar) {
    charts.sourceBar.data.datasets.forEach(ds => { ds.data = rnd(20,130,5); });
    charts.sourceBar.update('active');
  }
}

// ===== ADMIN =====
function adminLogin() {
  const u = document.getElementById('admin-user').value;
  const p = document.getElementById('admin-pass').value;
  if (u === 'admin' && p === '1234') {
    adminLoggedIn = true;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderTable(tableData);
    showToast('✅ 登入成功，歡迎回來！');
  } else {
    showToast('❌ 帳號或密碼錯誤');
  }
}

function adminLogout() {
  adminLoggedIn = false;
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
}

// ===== TABLE =====
function generateTableData() {
  if (tableData.length > 0) return;
  // 排除「現場調查」，避免產生假資料，現場調查資料由 fetchSurveyData 即時塞入
  const regularStakeholders = STAKEHOLDERS.filter(s => !s.isLive);
  
  for (let i = 0; i < 30; i++) {
    const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const sent = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];
    const texts = SAMPLE_TEXTS[sent];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const d = new Date(); d.setMinutes(d.getMinutes() - i * 3);
    tableData.push({
      time: d.toLocaleString('zh-TW'),
      source: src,
      stakeholder: regularStakeholders[Math.floor(Math.random() * regularStakeholders.length)].title,
      text, sentiment: sent,
      topic: TOPICS[Math.floor(Math.random() * TOPICS.length)].name,
      count: Math.floor(Math.random() * 50 + 1)
    });
  }
}

function renderTable(data) {
  const badge = { positive:'pos', negative:'neg', neutral:'neu' };
  const label = { positive:'正面', negative:'負面', neutral:'中性' };
  document.getElementById('table-body').innerHTML = data.map(r => `
    <tr>
      <td>${r.time}</td>
      <td>${r.source}</td>
      <td>${r.stakeholder}</td>
      <td>${r.text.substring(0,28)}…</td>
      <td><span class="badge ${badge[r.sentiment]}">${label[r.sentiment]}</span></td>
      <td>${r.topic}</td>
      <td>${r.count}</td>
    </tr>`).join('');
}

function filterTable() {
  const q = document.getElementById('table-search').value.toLowerCase();
  renderTable(tableData.filter(r =>
    r.text.includes(q) || r.source.toLowerCase().includes(q) ||
    r.topic.includes(q) || r.stakeholder.includes(q)
  ));
}

function exportCSV() {
  const headers = ['時間','來源','利害關係人','內容','情緒','議題','聲量'];
  const rows = tableData.map(r => [r.time, r.source, r.stakeholder, `"${r.text}"`, r.sentiment, r.topic, r.count]);
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }));
  a.download = `綠園道民意數據_${new Date().toLocaleDateString('zh-TW').replace(/\//g,'-')}.csv`;
  a.click();
  showToast('📥 CSV 匯出成功！');
}

// ===== KEYWORDS =====
function addKeyword() {
  const input = document.getElementById('new-keyword');
  const kw = input.value.trim();
  if (!kw) return;
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.innerHTML = `${kw}<button onclick="removeTag(this)">×</button>`;
  document.getElementById('keyword-tags').appendChild(tag);
  input.value = '';
  showToast(`✅ 已新增關鍵字：${kw}`);
}

function removeTag(btn) {
  btn.parentElement.remove();
}

// ===== AUTO REFRESH =====
let countdownSec = 300;
let countdownTimer = null;

function resetCountdown() {
  countdownSec = 300;
}

function startCountdown() {
  const el = document.getElementById('countdown');
  countdownTimer = setInterval(() => {
    countdownSec = Math.max(0, countdownSec - 1);
    const m = Math.floor(countdownSec / 60);
    const s = countdownSec % 60;
    if (el) el.textContent = `${m}:${String(s).padStart(2,'0')}`;
    if (countdownSec <= 0) {
      refreshData();
      countdownSec = 300;
    }
  }, 1000);
}

function startAutoRefresh() {
  const select = document.getElementById('refresh-rate');
  startCountdown();
  if (select) {
    select.addEventListener('change', () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
      const sec = parseInt(select.value);
      countdownSec = sec || 300;
      if (sec > 0) {
        refreshTimer = setInterval(refreshData, sec * 1000);
        startCountdown();
      }
    });
    refreshTimer = setInterval(refreshData, 300000);
  }
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
