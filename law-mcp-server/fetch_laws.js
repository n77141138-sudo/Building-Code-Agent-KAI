import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

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

async function run() {
  const allLaws = [];

  for (const source of SOURCES) {
    console.log(`Fetching ${source.name} from ${source.url}...`);
    try {
      const { data } = await axios.get(source.url);
      const $ = cheerio.load(data);
      
      let count = 0;
      $('.row').each((i, el) => {
        const artNo = $(el).find('.col-no').text().trim();
        const artContent = $(el).find('.col-data, .text-pre').text().trim();
        if (artNo && artContent) {
          allLaws.push({
            // Append source name to avoid duplicate article numbers
            article: `[${source.name}] ${artNo.replace(/\s+/g, ' ')}`,
            content: artContent.trim(),
            sourceType: source.name
          });
          count++;
        }
      });
      console.log(`-> Loaded ${count} articles for ${source.name}`);
    } catch (e) {
      console.error(`Failed to fetch ${source.name}:`, e.message);
    }
  }

  const outputPath = "C:/Users/user/.antigravity/cheng_yuan/Building-Code-Agent-KAI/app/src/laws_data.json";
  fs.writeFileSync(outputPath, JSON.stringify(allLaws, null, 2));
  console.log(`Successfully saved a total of ${allLaws.length} articles to laws_data.json!`);
}

run();
