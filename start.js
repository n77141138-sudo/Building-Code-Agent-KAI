const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ANSI Colors
const CYAN = '\x1b[96m';
const GREEN = '\x1b[92m';
const YELLOW = '\x1b[93m';
const RED = '\x1b[91m';
const BOLD = '\x1b[1m';
const MAGENTA = '\x1b[95m';
const NC = '\x1b[0m'; // No Color

const ASCII_ART = `
${CYAN}${BOLD}
   ____  ____  ________  __________  ____  ______   _____   _________________  ___
  / __ )/ __ \\/  _/ / / / __ \\/ __ \\/ __ \\/ __ \\   / __ \\ / ____/ ____/ __ \\/_  /
 / __  / / / // // / / / / / / / / / / / / / / /  / /_/ // / __/ __/ / / / // / 
/ /_/ / /_/ // // /_/ / /_/ / /_/ / /_/ / /_/ /  / /_  // /_/ / /___/ /_/ // /  
/____/ \\____/___/\\____/_____/_____/\\____/\\____/  /_/ \\_\\\\____/_____/_____//_/   
${NC}
${YELLOW}>> 建築法規 AI 權重分析系統 3.0 (Node Edition) <<${NC}
`;

function typeText(text, delay = 10) {
    return new Promise(resolve => {
        let i = 0;
        const interval = setInterval(() => {
            process.stdout.write(text[i]);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                process.stdout.write('\n');
                resolve();
            }
        }, delay);
    });
}

function killPort(port) {
    try {
        if (os.platform() === 'win32') {
            const output = execSync(`netstat -ano | findstr :${port}`).toString();
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.includes(`:${port}`) && line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    console.log(`${YELLOW}[!] 正在清理佔用端口 ${port} 的進程 (PID: ${pid})...${NC}`);
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                    return true;
                }
            }
        }
    } catch (e) {
        // Silently fail if no process found
    }
    return false;
}

async function main() {
    process.stdout.write('\x1Bc'); // Clear screen
    console.log(ASCII_ART);
    
    await typeText(`${MAGENTA}正在初始化核心系統模組...${NC}`, 10);
    
    killPort(9000);
    
    const appDir = path.join(process.cwd(), 'app');
    if (!fs.existsSync(path.join(appDir, 'package.json'))) {
        console.log(`${RED}[X] 錯誤: 找不到 app 目錄或 package.json${NC}`);
        return;
    }

    console.log(`\n${CYAN}--- 啟動流程 ---${NC}`);
    
    if (!fs.existsSync(path.join(appDir, 'node_modules'))) {
        console.log(`${YELLOW}[1/3] 正在安裝必要元件 (初次運行需較長時間)...${NC}`);
        execSync('npm install', { cwd: appDir, stdio: 'inherit' });
    } else {
        console.log(`${GREEN}[1/3] 元件庫檢查通過${NC}`);
    }

    console.log(`${YELLOW}[2/3] 正在喚醒 Vite 伺服器...${NC}`);
    
    const npm = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
    const server = spawn(npm, ['run', 'dev'], { 
        cwd: appDir,
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe']
    });

    server.stdout.on('data', (data) => {
        const line = data.toString();
        if (line.includes('VITE') || line.includes('ready')) {
            process.stdout.write(`${MAGENTA}> ${line.trim()}${NC}\n`);
        }
    });

    setTimeout(() => {
        console.log(`${GREEN}[3/3] 正在串接瀏覽器介面...${NC}`);
        const url = 'http://127.0.0.1:9000';
        const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
        require('child_process').exec(`${start} ${url}`);
        
        console.log(`\n${BOLD}${GREEN}===========================================${NC}`);
        console.log(`${BOLD}${GREEN}   ⚡ 系統掛載完畢，可開始使用！${NC}`);
        console.log(`${BOLD}${GREEN}   URL: ${url}${NC}`);
        console.log(`${BOLD}${GREEN}===========================================${NC}\n`);
        console.log(`${CYAN}提示: 按下 Ctrl+C 可以關閉系統。${NC}`);
    }, 4000);

    process.on('SIGINT', () => {
        console.log(`\n${YELLOW}[!] 正在執行關機程序...${NC}`);
        server.kill();
        process.exit();
    });
}

main();
