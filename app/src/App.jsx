import React, { useState } from 'react';
import { Search, Scale, FileText, CheckCircle, Building2, Zap, Layers, AlertCircle, Shield, TreePine, Accessibility } from 'lucide-react';
import './index.css';
import REAL_LAWS from './laws_data.json';

// Expanded Keyword Database with Categories, Synonyms and Weights
const categoryConfig = {
  "消防安全": { color: "#ef4444", icon: <Shield size={14} /> },
  "建築設計": { color: "#3b82f6", icon: <Layers size={14} /> },
  "節能綠建築": { color: "#10b981", icon: <TreePine size={14} /> },
  "土地管制": { color: "#f59e0b", icon: <MapPin size={14} /> },
  "無障礙": { color: "#8b5cf6", icon: <Accessibility size={14} /> },
  "結構耐震": { color: "#f97316", icon: <AlertCircle size={14} /> },
  "室內裝修": { color: "#ec4899", icon: <Building2 size={14} /> }
};

function MapPin(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
}

const keywordDatabase = [
  // 消防安全
  { words: ["防火", "防焰", "防火門", "防火區劃"], weight: 1.5, category: "消防安全" },
  { words: ["逃生", "避難", "緊急出口", "安全梯"], weight: 1.8, category: "消防安全" },
  { words: ["滅火器", "灑水", "排煙", "警報器", "消防"], weight: 1.5, category: "消防安全" },
  // 建築設計 
  { words: ["挑高", "夾層", "樓中樓", "高度"], weight: 1.2, category: "建築設計" },
  { words: ["停車", "車位", "機械車位", "坡道"], weight: 1.2, category: "建築設計" },
  { words: ["增建", "違建", "頂加", "違章", "外推"], weight: 1.5, category: "建築設計" },
  // 節能綠建築
  { words: ["綠建築", "綠化", "植栽", "保水"], weight: 1.0, category: "節能綠建築" },
  { words: ["節能", "通風", "採光", "太陽能", "隔熱", "日照"], weight: 1.2, category: "節能綠建築" },
  // 土地管制
  { words: ["建蔽率", "空地比"], weight: 1.5, category: "土地管制" },
  { words: ["容積率", "樓地板面積", "容積轉移"], weight: 1.5, category: "土地管制" },
  { words: ["住宅區", "商業區", "工業區", "使用條件", "土地分區", "基地"], weight: 1.0, category: "土地管制" },
  // 無障礙
  { words: ["無障礙", "輪椅", "坡道", "導盲", "殘障廁所", "昇降避難", "電梯", "公共"], weight: 1.5, category: "無障礙" },
  // 結構耐震
  { words: ["結構", "承重牆", "載重", "剪力牆", "鋼筋", "混凝土"], weight: 1.8, category: "結構耐震" },
  { words: ["耐震", "制震", "抗震", "阻尼器", "地震"], weight: 2.0, category: "結構耐震" },
  // 室內裝修
  { words: ["室內", "裝修", "裝潢", "木作", "系統櫃"], weight: 1.0, category: "室內裝修" },
  { words: ["隔間", "天花板", "輕隔間", "改建", "粉刷"], weight: 1.2, category: "室內裝修" }
];

function App() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedCategories, setExtractedCategories] = useState([]);
  const [suggestedArticles, setSuggestedArticles] = useState([]);

  const analyzeInput = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      let foundMatches = [];
      let totalWeight = 0;
      let categoriesMap = {};
      let flatActiveWords = [];

      keywordDatabase.forEach(item => {
        let matchedWords = [];
        item.words.forEach(word => {
          if (inputText.includes(word)) {
            matchedWords.push(word);
            flatActiveWords.push({ word, weight: item.weight });
          }
        });

        if (matchedWords.length > 0) {
          const compoundWeight = item.weight * (1 + (matchedWords.length - 1) * 0.2);

          if (!categoriesMap[item.category]) {
            categoriesMap[item.category] = {
              weight: 0,
              matchedWords: [],
              color: categoryConfig[item.category].color,
              icon: categoryConfig[item.category].icon
            };
          }
          categoriesMap[item.category].weight += compoundWeight;
          matchedWords.forEach(w => {
            if (!categoriesMap[item.category].matchedWords.includes(w)) {
              categoriesMap[item.category].matchedWords.push(w);
            }
          });

          totalWeight += compoundWeight;
          foundMatches.push({
            words: matchedWords,
            rawWeight: compoundWeight
          });
        }
      });

      // Normalize Categories Weight
      let categoryArray = [];
      if (totalWeight > 0) {
        Object.keys(categoriesMap).forEach(cat => {
          categoryArray.push({
            name: cat,
            normalized: Math.round((categoriesMap[cat].weight / totalWeight) * 100),
            color: categoriesMap[cat].color,
            icon: categoriesMap[cat].icon,
            words: categoriesMap[cat].matchedWords
          });
        });
        categoryArray.sort((a, b) => b.normalized - a.normalized);
      }
      setExtractedCategories(categoryArray);

      // Score the *actual laws* from MCP data
      let scoredLaws = REAL_LAWS.map(law => {
        let score = 0;
        let triggers = [];

        flatActiveWords.forEach(activeTerm => {
          // Simple substring matching in the real law text
          const regex = new RegExp(activeTerm.word, 'gi');
          const matches = law.content.match(regex) || (law.article.includes(activeTerm.word) ? [1] : null);

          if (matches) {
            // Logarithmic weight calculation based on frequency
            const count = matches.length;
            score += activeTerm.weight * (1 + Math.log(count));
            if (!triggers.includes(activeTerm.word)) triggers.push(activeTerm.word);
          }
        });

        return {
          ...law,
          score: Math.round(score * 10) / 10,
          triggers
        };
      }).filter(law => law.score > 0);

      scoredLaws.sort((a, b) => b.score - a.score);
      // Top 10 articles
      setSuggestedArticles(scoredLaws.slice(0, 10));
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="title">法規即時檢索 </h1>
        <p className="subtitle">查不到，不是沒有，是我還沒用完</p>
      </header>

      <div className="glass-panel input-section">
        <label className="input-label">
          <Building2 size={24} color="#3b82f6" />
          請輸入描述或指令...
        </label>

        <textarea
          className="styled-textarea"
          placeholder="帥哥美女指令請打這，怕畫面太亂看不到，所以提醒你"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button className="styled-button" onClick={analyzeInput} disabled={isAnalyzing || !inputText.trim()}>
          {isAnalyzing ? (
            <>
              <div className="loader"></div>
              實時查找全文中...
            </>
          ) : (
            <>
              <Zap size={20} />
              檢索適用真實法條
            </>
          )}
        </button>
      </div>

      <div className="results-container">
        {/* Keywords Category Panel */}
        <div className="glass-panel" style={{ alignSelf: 'start' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Scale size={20} color="#f59e0b" />
            權重解析與領域傾向
          </h2>

          <div className="keywords-list">
            {extractedCategories.length === 0 && !isAnalyzing && (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <Layers size={36} className="empty-icon" />
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>系統將彙整輸入詞句的傾向</span>
              </div>
            )}

            {extractedCategories.map((cat, idx) => (
              <div className="category-item" key={idx}>
                <div className="category-header">
                  <div className="cat-title" style={{ color: cat.color }}>
                    {cat.icon}
                    <span className="cat-name">{cat.name}</span>
                  </div>
                  <span className="category-weight" style={{ color: cat.color }}>{cat.normalized}%</span>
                </div>

                <div className="weight-bar-bg" style={{ height: '6px', marginBottom: '0.75rem' }}>
                  <div className="weight-bar-fill" style={{ width: `${cat.normalized}%`, background: cat.color }}></div>
                </div>

                <div className="matched-words-chips">
                  {cat.words.map((word, widx) => (
                    <span key={widx} className="word-chip" style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested ACTUAL Full Articles Panel */}
        <div className="glass-panel">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FileText size={20} color="#10b981" />
            《建築法》實體條文檢索結果
          </h2>

          <div className="regulations-list">
            {suggestedArticles.length === 0 && !isAnalyzing && (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <CheckCircle size={36} className="empty-icon" />
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>從 123 條建築法中，將即時印出真實條文內容！</span>
              </div>
            )}

            {suggestedArticles.map((law, idx) => (
              <div className="regulation-card" key={idx}>
                <div className="card-header">
                  <div style={{ flex: 1 }}>
                    <h3 className="card-title" style={{ fontSize: '1.15rem' }}>{law.article}</h3>
                  </div>
                  <div className="match-score">
                    分數: {law.score}
                  </div>
                </div>

                {/* Real content from the moj.gov.tw website */}
                <p className="regulation-desc" style={{ whiteSpace: 'pre-wrap', color: '#f8fafc' }}>
                  {law.content}
                </p>

                <div className="matched-tags" style={{ marginTop: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>🎯 命中關鍵字：</span>
                  {law.triggers.map((kw, tidx) => (
                    <span className="tag" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderColor: '#ef4444' }} key={tidx}>#{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
