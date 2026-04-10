import subprocess
import os
import sys
import time
import webbrowser
import platform
"python start.py"
# ANSI Colors
CYAN = '\033[96m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
MAGENTA = '\033[95m'
NC = '\033[0m' # No Color

ASCII_ART = f"""
{CYAN}{BOLD}
   ____  ____  ________  __________  ____  ______   _____   _________________  ___
  / __ )/ __ \/  _/ / / / __ \/ __ \/ __ \/ __ \   / __ \ / ____/ ____/ __ \/_  /
 / __  / / / // // / / / / / / / / / / / / / / /  / /_/ // / __/ __/ / / / // / 
/ /_/ / /_/ // // /_/ / /_/ / /_/ / /_/ / /_/ /  / /_  // /_/ / /___/ /_/ // /  
/____/ \____/___/\____/_____/_____/\____/\____/  /_/ \_\\____/_____/_____//_/   
{NC}
{YELLOW}>> 建築法規 AI 權重分析系統 2.0 <<{NC}
"""

def type_text(text, delay=0.01):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def kill_port(port):
    """Kills the process using the specified port."""
    try:
        if platform.system() == "Windows":
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            for line in result.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    pid = parts[-1]
                    type_text(f"{YELLOW}[!] 檢測到端口 {port} 被佔用，正在強制重啟伺服器... (PID: {pid}){NC}")
                    subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
                    time.sleep(1)
                    return True
    except Exception:
        pass
    return False

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(ASCII_ART)
    
    type_text(f"{MAGENTA}正在初始化核心系統模組...{NC}", 0.02)
    time.sleep(0.5)
    
    kill_port(9000)
    
    app_dir = os.path.join(os.getcwd(), 'app')
    if not os.path.exists(os.path.join(app_dir, 'package.json')):
        print(f"{RED}[X] 錯誤: 找不到 app 目錄或 package.json{NC}")
        return

    print(f"\n{CYAN}--- 啟動流程 ---{NC}")
    
    # Check node_modules
    if not os.path.exists(os.path.join(app_dir, 'node_modules')):
        print(f"{YELLOW}[1/3] 正在安裝必要元件 (初次運行需較長時間)...{NC}")
        subprocess.run(['npm', 'install'], cwd=app_dir, shell=True)
    else:
        print(f"{GREEN}[1/3] 元件庫檢查通過{NC}")

    print(f"{YELLOW}[2/3] 正在喚醒 Vite 伺服器...{NC}")
    
    # Run dev server
    cmd = "cmd /c npm run dev"
    try:
        process = subprocess.Popen(cmd, cwd=app_dir, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Open browser after a small delay
        time.sleep(3)
        print(f"{GREEN}[3/3] 正在串接瀏覽器介面...{NC}")
        webbrowser.open("http://127.0.0.1:9000")
        
        print(f"\n{BOLD}{GREEN}==========================================={NC}")
        print(f"{BOLD}{GREEN}   ⚡ 系統掛載完畢，可開始使用！{NC}")
        print(f"{BOLD}{GREEN}   URL: http://127.0.0.1:9000{NC}")
        print(f"{BOLD}{GREEN}==========================================={NC}\n")
        
        print(f"{CYAN}伺服器日誌監控中 (Ctrl+C 結束行程):{NC}")
        
        # Stream the output
        for line in process.stdout:
            if "VITE" in line or "ready" in line:
                print(f"{MAGENTA}> {line.strip()}{NC}")
            elif "Error" in line:
                print(f"{RED}> {line.strip()}{NC}")
            
    except KeyboardInterrupt:
        print(f"\n{YELLOW}[!] 正在執行關機程序...{NC}")
        process.terminate()
        print(f"{GREEN}[V] 系統已安全中斷。{NC}")
    except Exception as e:
        print(f"{RED}[X] 嚴重錯誤: {e}{NC}")

if __name__ == "__main__":
    main()
".\啟動系統.bat"
