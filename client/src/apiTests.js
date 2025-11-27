const API_URL = "https://fsefes";

global.fetch = async (url, options = {}) => {
  if (url.endsWith("/products") && (!options.method || options.method === "GET")) {
    return {
      ok: true,
      json: async () => [
        { id: 1, name: "Хліб", price: 25 },
        { id: 2, name: "Молоко", price: 30 }
      ]
    };
  }

  if (url.endsWith("/products") && options.method === "POST") {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ id: 3, ...body })
    };
  }

  if (url.includes("/products/") && options.method === "DELETE") {
    return { ok: true };
  }

  return { ok: false };
};

// --- ФУНКЦІЇ ДЛЯ ТЕСТІВ (твої API виклики) ---
async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`, {
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Помилка завантаження");
  return res.json();
}

async function addProduct(name, price) {
  if (!name || !price) throw new Error("Некоректні дані");

  const newProduct = {
    name,
    price: Number(price),
    category: "Інше"
  };

  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(newProduct)
  });

  if (!res.ok) throw new Error("Помилка додавання");
  return res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: { "ngrok-skip-browser-warning": "true" }
  });
  if (!res.ok) throw new Error("Помилка видалення");
  return res;
}

// --- ЮНІТ-ТЕСТИ ---
async function runTests() {
  console.log("🧪 Запуск юніт-тестів...\n");

  try {
    console.log("🔹 Тест 1: fetchProducts()");
    const products = await fetchProducts();
    console.assert(Array.isArray(products), "❌ fetchProducts не повернув масив");
    console.assert(products.length === 2, "❌ Очікувалось 2 продукти");
    console.log("✅ Пройдено");

    console.log("🔹 Тест 2: addProduct()");
    const newProd = await addProduct("Сир", 80);
    console.assert(newProd.name === "Сир", "❌ Ім’я продукту неправильне");
    console.assert(newProd.price === 80, "❌ Ціна продукту неправильна");
    console.log("✅ Пройдено");

    console.log("🔹 Тест 3: deleteProduct()");
    const del = await deleteProduct(1);
    console.assert(del.ok === true, "❌ DELETE не виконався");
    console.log("✅ Пройдено");

    console.log("\n🎉 Усі тести успішно пройдені!");
  } catch (err) {
    console.error("❌ Помилка тесту:", err.message);
  }
}

runTests();
