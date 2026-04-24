"""
votes_server.py
本地資料橋接伺服器 - 讀取 votes.json 並以 HTTP + CORS 提供給分析網站

啟動方式: python votes_server.py
預設端口: 8765
端點:     GET http://localhost:8765/votes
"""

import http.server
import json
import os
import sys

PORT = 8765
VOTES_FILE = os.path.join(os.path.dirname(__file__), '現場調查', 'votes.json')

class VotesHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/votes':
            self.send_votes()
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()

    def send_votes(self):
        try:
            if os.path.exists(VOTES_FILE):
                with open(VOTES_FILE, 'r', encoding='utf-8') as f:
                    data = f.read()
            else:
                # 若 votes.json 不存在，回傳預設空資料
                data = json.dumps({
                    'total': 0, 'supportPct': 0, 'opposePct': 0,
                    'avgUnderstanding': 0, 'comments': [], 'records': [],
                    'lastUpdated': None
                }, ensure_ascii=False)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(data.encode('utf-8'))

        except Exception as e:
            self.send_error(500, str(e))

    def log_message(self, format, *args):
        # 簡化 log 輸出
        print(f'  [資料橋接] {args[0]} {args[1]}')

if __name__ == '__main__':
    print()
    print('  ════════════════════════════════════════')
    print('   現場調查 資料橋接伺服器')
    print(f'   端口: http://localhost:{PORT}/votes')
    print(f'   資料檔案: {VOTES_FILE}')
    print('   按 Ctrl+C 停止')
    print('  ════════════════════════════════════════')
    print()

    try:
        server = http.server.HTTPServer(('localhost', PORT), VotesHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  [資料橋接] 伺服器已停止。')
        sys.exit(0)
    except OSError as e:
        if 'Address already in use' in str(e) or '10048' in str(e):
            print(f'  [錯誤] 端口 {PORT} 已被佔用，請先關閉其他佔用該端口的程式。')
        else:
            print(f'  [錯誤] {e}')
        sys.exit(1)
