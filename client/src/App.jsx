import { useState, useEffect } from 'react'
import React from 'react'; // <--- ОСЬ ЦЕ ДОДАЙ


// ... далі твій код ...
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  const API_URL = "https://eastbound-lizette-avowedly.ngrok-free.dev/";

  const fetchProducts = () => {
    fetch(`${API_URL}/products`, {
      headers: {
        "ngrok-skip-browser-warning": "true" 
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Дані прийшли:", data);
        setProducts(data);
      })
      .catch(err => console.error("Помилка завантаження:", err))
  }

  useEffect(() => {
    fetchProducts();
  }, [])

  const handleAdd = (e) => {
    e.preventDefault();
    
    if (!name || !price) return alert("Заповни всі поля!");

    const newProduct = {
      name: name,
      price: Number(price),
      category: "Інше"
    }

    fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true" 
      },
      body: JSON.stringify(newProduct)
    })
    .then(res => {
      if (res.ok) {
        fetchProducts(); 
        setName("");    
        setPrice("");
      } else {
        alert("Сервер повернув помилку");
      }
    })
    .catch(err => console.error("Помилка додавання:", err))
  }

  const handleDelete = (id) => {
    fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    })
    .then(res => {
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    })
    .catch(err => console.error("Помилка видалення:", err))
  }

  return (
    <div className="app-container">
      <h1>🛒 Менеджер Товарів</h1>
      <p className="server-info">Сервер: {API_URL}</p>

      <form onSubmit={handleAdd} className="add-form">
        <input 
          type="text" 
          placeholder="Назва (напр. Хліб)" 
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field name-input"
        />
        <input 
          type="number" 
          placeholder="Ціна" 
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="input-field price-input"
        />
        <button type="submit" className="btn-add">
          Додати
        </button>
      </form>

      <div className="product-list-container">
        {products.length === 0 ? (
          <p className="empty-message">Список порожній, додайте щось...</p>
        ) : null}
        
        <ul className="product-list">
          {products.map(product => (
            <li key={product.id} className="product-item">
              <div className="product-info">
                <span className="product-name">{product.name}</span> 
                <span className="product-price">{product.price} грн</span>
              </div>
              
              <button 
                onClick={() => handleDelete(product.id)}
                className="btn-delete"
                title="Видалити"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App