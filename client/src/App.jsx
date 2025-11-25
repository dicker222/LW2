import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([]) // Тут живе список
  const [name, setName] = useState("")         // Тут назва нового товару
  const [price, setPrice] = useState("")       // Тут ціна нового товару

  // 1. ЗАВАНТАЖЕННЯ (GET)
  // Як тільки сайт відкрився — тягнемо дані з сервера
  useEffect(() => {
    fetchProducts();
  }, [])

  const fetchProducts = () => {
    fetch('http://localhost:8080/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Помилка з'єднання:", err))
  }

  // 2. ДОДАВАННЯ (POST)
  const handleAdd = (e) => {
    e.preventDefault(); // Щоб сторінка не перезавантажилась
    
    if (!name || !price) return alert("Заповни всі поля!");

    const newProduct = {
      name: name,
      price: Number(price), // Сервер хоче число, а не рядок
      category: "Інше"      // Заглушка, бо ми поки не вибираємо категорію
    }

    fetch('http://localhost:8080/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
    .then(res => {
      if (res.ok) {
        fetchProducts(); // Оновлюємо список після додавання
        setName("");     // Чистимо поля
        setPrice("");
      }
    })
  }

  // 3. ВИДАЛЕННЯ (DELETE)
  const handleDelete = (id) => {
    fetch(`http://localhost:8080/products/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        // Прибираємо товар з екрану без перезавантаження
        setProducts(products.filter(p => p.id !== id))
      }
    })
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🛒 Менеджер Товарів</h1>

      {/* ФОРМА ДОДАВАННЯ */}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="Назва товару (напр. Хліб)" 
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: "8px", flex: 1 }}
        />
        <input 
          type="number" 
          placeholder="Ціна" 
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{ padding: "8px", width: "80px" }}
        />
        <button type="submit" style={{ padding: "8px 20px", cursor: "pointer" }}>
          Додати
        </button>
      </form>

      {/* СПИСОК ТОВАРІВ */}
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
        {products.length === 0 ? <p>Список порожній...</p> : null}
        
        {products.map(product => (
          <div key={product.id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            borderBottom: "1px solid #eee", 
            padding: "10px 0" 
          }}>
            <div>
              <strong>{product.name}</strong> 
              <span style={{ color: "green", marginLeft: "10px" }}>{product.price} грн</span>
              <span style={{ color: "gray", fontSize: "0.8em", marginLeft: "10px" }}>({product.category})</span>
            </div>
            
            <button 
              onClick={() => handleDelete(product.id)}
              style={{ background: "red", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
              Видалити
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App