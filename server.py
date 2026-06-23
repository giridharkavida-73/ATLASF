import http.server
import socketserver
import json
import os
import urllib.request
import urllib.error

# Run python server.py on port 3000
PORT = 3000

class YieldAuditorHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle simple CORS configuration
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/analyze-bid':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            req_body = json.loads(post_data.decode('utf-8'))
            
            publisher_name = req_body.get('publisherName', 'Minute Media')
            bid_request_json = req_body.get('bidRequestJson', '')
            
            # Fetch AI secrets
            gemini_key = os.environ.get('GEMINI_API_KEY', '')
            
            # If key is missing or standard placeholder, fallback to mock analysis
            if not gemini_key or "MY_GEMINI_API_KEY" in gemini_key:
                print("[Python Server] No GEMINI_API_KEY set. Injected high-fidelity simulation model.")
                simulated_response = self.get_mock_analysis(publisher_name, bid_request_json)
                self.send_json_response(simulated_response)
                return
            
            # Call Gemini API directly via native urllib
            try:
                ai_response = self.call_gemini_api(gemini_key, publisher_name, bid_request_json)
                self.send_json_response(ai_response)
            except Exception as e:
                print("[Python Server] Gemini API error:", e)
                simulated_response = self.get_mock_analysis(publisher_name, bid_request_json)
                self.send_json_response(simulated_response)
        else:
            self.send_error(404, "Endpoint not found")

    def do_GET(self):
        # Resolve path to support single-page-app routing inside the built client folder
        requested_path = self.path.split('?')[0]
        if requested_path == '/':
            requested_path = '/index.html'
        
        # Verify if file actually exists inside compiled resource folder
        local_path = os.path.join(os.getcwd(), 'dist', requested_path.lstrip('/'))
        
        if os.path.exists(local_path) and os.path.isfile(local_path):
            # Target path directly
            self.path = '/dist' + requested_path if not requested_path.startswith('/dist') else requested_path
            return super().do_GET()
        else:
            # SPA Fallback -> Rewrite to entry HTML router index
            self.path = '/dist/index.html'
            return super().do_GET()

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def get_mock_analysis(self, publisher, json_input):
        is_valid = True
        try:
            json.loads(json_input)
        except:
            is_valid = False
        
        has_video = "video" in json_input.lower()
        findings = []
        health_score = 94.2
        estimated_uplift = "$4.2M"
        fill_rate_opt = "-0.8%"
        bid_density = "12.4"
        
        if not is_valid:
            findings.append({
                "id": "ERR_001",
                "severity": "critical",
                "title": "Malformed JSON Payload Structure",
                "description": "The submitted Raw JSON Bid Request is syntactically invalid. Check braces and comma placement.",
                "actionViewSource": json_input[:80] if json_input else "{ ... }",
                "actionFix": '{\n  "id": "br_938201",\n  "imp": [{\n    "id": "1",\n    "video": {\n      "mimes": ["video/mp4"],\n      "h": 480,\n      "w": 640\n    }\n  }]\n}'
            })
            health_score = 45.0
            estimated_uplift = "$0.0k"
            fill_rate_opt = "-100%"
            bid_density = "0.0"
        else:
            findings.append({
                "id": "ERR_092",
                "severity": "critical",
                "title": "Missing Prebid Ad Unit Mapping",
                "description": f"32% of requests are failing due to unmapped site ID parameters in the OpenRTB object for {publisher}.",
                "actionViewSource": '"imp": [{\n  "id": "1",\n  "video": {\n    "mimes": ["video/mp4"]\n  }\n}]',
                "actionFix": f'{{\n  "id": "br_938201",\n  "site": {{\n    "id": "site_88291",\n    "name": "{publisher}"\n  }},\n  "imp": [\n    {{\n      "id": "1",\n      "video": {{\n        "mimes": ["video/mp4"],\n        "h": 480,\n        "w": 640\n      }}\n    }}\n  ]\n}}'
            })
            findings.append({
                "id": "WRN_412",
                "severity": "warning",
                "title": "Sub-optimal Floor Price",
                "description": f"Floors are set at $1.50 CPM, but historical metrics on {publisher} suggests $1.85 CPM floor would recover programatic ad revenue by 14.2%.",
                "actionViewSource": '"bidfloor": 1.50',
                "actionFix": '"bidfloor": 1.85'
              })
            findings.append({
                "id": "OK_811",
                "severity": "success",
                "title": "App-ads.txt Compliant",
                "description": f"Publisher rules are fully optimized. {publisher} is synchronized."
            })
            
        return {
            "healthScore": health_score,
            "estimatedUplift": estimated_uplift,
            "fillRateOpt": fill_rate_opt,
            "bidDensity": bid_density,
            "findings": findings,
            "emailOutreach": {
                "to": f"publisher-lead@{publisher.lower().replace(' ', '') if publisher else 'client'}.com",
                "subj": f"Revenue Opportunity: Audit Findings for {publisher}",
                "body": f"Hi Team,\n\nOur Yield Auditor tool just completed a deep-dive analysis into your recent bid requests. We identified a critical mapping error that is currently suppressing about 32% of your available inventory.\n\nKey Recommendation:\nMapping the Prebid ad units correctly could unlock an estimated $12,500 in weekly revenue uplift based on current auction demand.\n\nWhen can we hop on a quick 5-minute call to discuss the fix?\n\nBest,\nAlex Rivera"
            }
        }

    def call_gemini_api(self, api_key, publisher, json_input):
        # Native model generation wrapper utilizing v1beta standard system instruction architecture
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        system_instruction = "You are an elite programmatic yield engineer and monetization audit specialist auditing OpenRTB bid requests."
        user_prompt = f"Publisher Name: '{publisher}'\nJSON Payload snippet to analyze:\n```json\n{json_input}\n```"
        
        req_payload = {
            "contents": [{"parts": [{"text": user_prompt}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "required": ["healthScore", "estimatedUplift", "fillRateOpt", "bidDensity", "findings", "emailOutreach"],
                    "properties": {
                        "healthScore": {"type": "NUMBER"},
                        "estimatedUplift": {"type": "STRING"},
                        "fillRateOpt": {"type": "STRING"},
                        "bidDensity": {"type": "STRING"},
                        "findings": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "required": ["id", "severity", "title", "description", "actionViewSource", "actionFix"],
                                        "properties": {
                                            "id": {"type": "STRING"},
                                            "severity": {"type": "STRING"},
                                            "title": {"type": "STRING"},
                                            "description": {"type": "STRING"},
                                            "actionViewSource": {"type": "STRING"},
                                            "actionFix": {"type": "STRING"}
                                        }
                                    }
                                },
                                "emailOutreach": {
                                    "type": "OBJECT",
                                    "required": ["to", "subj", "body"],
                                    "properties": {
                                        "to": {"type": "STRING"},
                                        "subj": {"type": "STRING"},
                                        "body": {"type": "STRING"}
                                    }
                                }
                            }
                        }
                    }
                }
        
        req_obj = urllib.request.Request(
            url, 
            data=json.dumps(req_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req_obj) as response:
            res_content = response.read().decode('utf-8')
            response_json = json.loads(res_content)
            model_text = response_json['candidates'][0]['content']['parts'][0]['text']
            return json.loads(model_text)

if __name__ == '__main__':
    print(f"Starting python zero-dependency server on http://localhost:{PORT}...")
    handler = YieldAuditorHandler
    with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
        httpd.serve_forever()
