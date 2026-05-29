import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = 8000

class CleanbukHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/admin/orders':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            orders = []
            if os.path.exists('orders.json'):
                try:
                    with open('orders.json', 'r') as f:
                        orders = json.load(f)
                except json.JSONDecodeError:
                    pass
            self.wfile.write(json.dumps(orders).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/order':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            order_details = json.loads(post_data.decode('utf-8'))
            
            order_details['timestamp'] = datetime.now().isoformat()
            
            # Save to orders.json
            orders = []
            if os.path.exists('orders.json'):
                try:
                    with open('orders.json', 'r') as f:
                        orders = json.load(f)
                except json.JSONDecodeError:
                    pass
            
            orders.append(order_details)
            
            with open('orders.json', 'w') as f:
                json.dump(orders, f, indent=4)
                
            print(f"New order received: {order_details['product']} - {order_details['price']}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success', 'message': 'Order successfully placed'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanbukHandler) as httpd:
        print(f"🚀 Backend Server running at http://localhost:{PORT}")
        print("Serving frontend files and listening for orders...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()
