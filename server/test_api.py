import unittest
import threading
import time
import json
import http.client
from http.server import HTTPServer
from api import ProductServer

HOST = "localhost"
PORT = 8080

class TestProductAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer((HOST, PORT), ProductServer)
        cls.thread = threading.Thread(target=cls.server.serve_forever)
        cls.thread.daemon = True
        cls.thread.start()
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.thread.join()

    def request(self, method, path, body=None, headers=None):
        """Допоміжний метод для запитів до сервера"""
        conn = http.client.HTTPConnection(HOST, PORT)
        if headers is None:
            headers = {}
        if body is not None and not isinstance(body, str):
            body = json.dumps(body)
            headers["Content-Type"] = "application/json"
        conn.request(method, path, body, headers)
        response = conn.getresponse()
        data = response.read().decode()
        conn.close()
        return response.status, data

    def test_get_all_products(self):
        status, data = self.request("GET", "/products")
        self.assertEqual(status, 200)
        products = json.loads(data)
        self.assertIsInstance(products, list)
        self.assertGreaterEqual(len(products), 2)

    def test_get_single_product(self):
        status, data = self.request("GET", "/products/1")
        self.assertEqual(status, 200)
        product = json.loads(data)
        self.assertIn("name", product)

    def test_add_product(self):
        new_product = {"name": "Сир", "price": 79.9, "category": "Молочне"}
        status, data = self.request("POST", "/products", new_product)
        self.assertEqual(status, 201)
        product = json.loads(data)
        self.assertEqual(product["name"], "Сир")

    def test_update_product(self):
        update_data = {"price": 33.5, "name": "Оновлений Хліб"}
        status, data = self.request("PUT", "/products/1", update_data)
        self.assertEqual(status, 200)
        product = json.loads(data)
        self.assertEqual(product["name"], "Оновлений Хліб")

    def test_delete_product(self):
        status, data = self.request("DELETE", "/products/2")
        self.assertEqual(status, 200)
        msg = json.loads(data)
        self.assertIn("Продукт видалено", msg["message"])


if __name__ == "__main__":
    unittest.main()
