import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# Наш список продуктів (in-memory)
products = [
    {"id": 1, "name": "Хліб", "price": 25.0, "category": "Бакалія"},
    {"id": 2, "name": "Молоко", "price": 30.0, "category": "Молочне"}
]

class ProductServer(BaseHTTPRequestHandler):

    # --- Відповідь у форматі JSON ---
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

    # --- GET запити ---
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
            self.send_json({"message": "Сервер працює. Використай /products"}, 200)

    # --- POST запити ---
    def do_POST(self):
        if self.path == "/products":
            length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(length)
            try:
                product_data = json.loads(data)
                if "name" not in product_data or "price" not in product_data:
                    return self.send_json({"error": "Некоректні дані"}, 400)

                new_product = {
                    "id": products[-1]["id"] + 1 if products else 1,
                    "name": product_data["name"],
                    "price": product_data["price"],
                    "category": product_data.get("category", "Інше")
                }
                products.append(new_product)
                self.send_json(new_product, 201)
            except json.JSONDecodeError:
                self.send_json({"error": "Некоректний JSON"}, 400)
        else:
            self.send_json({"error": "Невідомий маршрут"}, 404)

    # --- PUT запити ---
    def do_PUT(self):
        if self.path.startswith("/products/"):
            try:
                pid = int(self.path.split("/")[-1])
                product = next((p for p in products if p["id"] == pid), None)
                if not product:
                    return self.send_json({"error": "Продукт не знайдено"}, 404)

                length = int(self.headers.get('Content-Length', 0))
                data = json.loads(self.rfile.read(length))
                product["name"] = data.get("name", product["name"])
                product["price"] = data.get("price", product["price"])
                product["category"] = data.get("category", product["category"])
                self.send_json(product, 200)
            except:
                self.send_json({"error": "Помилка оновлення"}, 400)
        else:
            self.send_json({"error": "Невідомий маршрут"}, 404)

    # --- DELETE запити ---
    def do_DELETE(self):
        if self.path.startswith("/products/"):
            try:
                pid = int(self.path.split("/")[-1])
                global products
                products = [p for p in products if p["id"] != pid]
                self.send_json({"message": "Продукт видалено"}, 200)
            except:
                self.send_json({"error": "Некоректний ID"}, 400)
        else:
            self.send_json({"error": "Невідомий маршрут"}, 404)


# --- Запуск сервера ---
if __name__ == "__main__":
    host = "localhost"
    port = 8080
    server = HTTPServer((host, port), ProductServer)
    print(f"Сервер запущено на http://{host}:{port}")
    print("Зупинити: Ctrl + C")
    server.serve_forever()
