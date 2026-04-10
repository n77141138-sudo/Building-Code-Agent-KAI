import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

// Initialize the MCP server
const server = new McpServer({
  name: "building-law-agent",
  version: "1.1.0",
});

let cachedLaws = [];
const SOURCES = [
  { 
    name: "建築法", 
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070109" 
  },
  { 
    name: "建築設計施工編", 
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070115" 
  },
  { 
    name: "建築構造編", 
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070117" 
  },
  { 
    name: "身心障礙者權益保障法(無障礙)", 
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0020057" 
  }
];

/**
 * Fetch and parse the law articles from MOJ
 */
async function fetchLawArticles() {
  if (cachedLaws.length > 0) return cachedLaws;

  const laws = [];
  for (const source of SOURCES) {
    try {
      const { data } = await axios.get(source.url);
      const $ = cheerio.load(data);

      $('.row').each((i, el) => {
        const artNo = $(el).find('.col-no').text().trim();
        const artContent = $(el).find('.col-data, .text-pre').text().trim();
        
        if (artNo && artContent) {
          const cleanArtNo = `[${source.name}] ${artNo.replace(/\s+/g, ' ')}`;
          laws.push({
            article: cleanArtNo,
            content: artContent,
            sourceType: source.name,
            fullText: `${cleanArtNo} ${artContent}`
          });
        }
      });
    } catch (error) {
      console.error(`Error fetching law ${source.name}:`, error.message);
    }
  }
  
  cachedLaws = laws;
  console.error(`[MCP] Successfully loaded ${laws.length} articles from comprehensive databases.`);
  return laws;
}

/**
 * Core analysis function for ranking laws by keyword weight
 */
function searchWithWeights(laws, keywords, limit = 5) {
  const scored = laws.map(law => {
    let score = 0;
    let matchedTerms = [];

    keywords.forEach((kw) => {
      let term = kw;
      let weight = 1.0;
      if (kw.includes(":")) {
        const parts = kw.split(":");
        term = parts[0];
        weight = parseFloat(parts[1]) || 1.0;
      }

      const regex = new RegExp(term, 'gi');
      const matches = law.fullText.match(regex);
      if (matches) {
        score += weight * (1 + Math.log(matches.length));
        matchedTerms.push({ term, count: matches.length, weight });
      }
    });

    return {
      ...law,
      score,
      matchedTerms
    };
  });

  return scored
    .filter(law => law.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Registering the MCP Tool
server.tool(
  "search_law_articles",
  "搜尋法條工具：根據關鍵字權重檢索對應的最符合法條，回傳完整條文 (Search related law articles based on keyword weights)",
  {
    keywords: z.array(z.string()).describe("List of keywords to search for. Can include weights like '防火:1.5', '逃生:1.2', or just '建蔽率'"),
    top_k: z.number().optional().describe("Number of top articles to return. Default to 5.")
  },
  async ({ keywords, top_k }) => {
    const limit = top_k || 5;
    const laws = await fetchLawArticles();
    
    if (laws.length === 0) {
      return {
        content: [{ type: "text", text: "未能成功抓取法條資料庫，請稍後再試。" }]
      };
    }

    const results = searchWithWeights(laws, keywords, limit);

    if (results.length === 0) {
      return {
        content: [{ type: "text", text: "無符合相關關鍵字的法條。" }]
      };
    }

    let outputText = `## ⚖️ 建築法令綜合搜尋結果 (Top ${results.length})\n\n`;
    
    results.forEach((res, index) => {
      outputText += `### 💡 排名 #${index + 1}： **${res.article}** (總權重積分: ${res.score.toFixed(2)})\n`;
      const termStr = res.matchedTerms.map(m => '`' + m.term + '`' + ` (${m.count}次, 權重${m.weight})`).join(", ");
      outputText += `> **觸發關鍵字**：${termStr}\n\n`;
      outputText += `**條文內容**：\n\`\`\`text\n${res.content}\n\`\`\`\n\n`;
      outputText += `---\n\n`;
    });

    return {
      content: [{ type: "text", text: outputText }]
    };
  }
);

// Start the server
async function main() {
  await fetchLawArticles();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
