import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

products = [
    {"id": 1, "name": "Хліб", "price": 25.0, "category": "Бакалія"},
    {"id": 2, "name": "Молоко", "price": 30.0, "category": "Молочне"}
]

class ProductServer(BaseHTTPRequestHandler):

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        
        self.send_header("Access-Control-Allow-Headers", "*") 
        
        self.end_headers()

    def send_json(self, data, status=200):
        self._set_headers(status)
        try:
            response_body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
            self.wfile.write(response_body)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/products":
            self.send_json(products)
        elif parsed.path.startswith("/products/"):
            try:
                pid = int(parsed.path.split("/")[-1])
                product = next((p for p in products if p["id"] == pid), None)
                if product:
                    self.send_json(product)
                else:
                    self.send_json({"error": "Продукт не знайдено"}, 404)
            except ValueError:
                self.send_json({"error": "Некоректний ID"}, 400)
        else:
            self.send_json({"message": "API працює! Використовуй /products"}, 200)

    def do_POST(self):
        if self.path == "/products":
            try:
                length = int(self.headers.get('Content-Length', 0))
                data = self.rfile.read(length)
                product_data = json.loads(data)

                if "name" not in product_data or "price" not in product_data:
                    return self.send_json({"error": "Треба поля name та price"}, 400)

                new_product = {
                    "id": products[-1]["id"] + 1 if products else 1,
                    "name": product_data["name"],
                    "price": float(product_data["price"]), # Гарантуємо, що це число
                    "category": product_data.get("category", "Інше")
                }
                products.append(new_product)
                self.send_json(new_product, 201)
            except json.JSONDecodeError:
                self.send_json({"error": "Кривий JSON"}, 400)
            except Exception as e:
                self.send_json({"error": str(e)}, 400)
        else:
            self.send_json({"error": "Невідомий маршрут"}, 404)

    def do_DELETE(self):
        if self.path.startswith("/products/"):
            try:
                pid = int(self.path.split("/")[-1])
                global products
                initial_len = len(products)
                products = [p for p in products if p["id"] != pid]
                
                if len(products) < initial_len:
                    self.send_json({"message": "Видалено"}, 200)
                else:
                    self.send_json({"error": "Товар не знайдено"}, 404)
            except ValueError:
                self.send_json({"error": "Некоректний ID"}, 400)
        else:
            self.send_json({"error": "Невідомий маршрут"}, 404)


if __name__ == "__main__":
    host = "localhost"
    port = 8080
    server = HTTPServer((host, port), ProductServer)
    print(f"✅ СЕРВЕР ЗАПУЩЕНО: http://{host}:{port}")
    print("Щоб зупинити натисни: Ctrl + C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass