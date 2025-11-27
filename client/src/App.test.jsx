// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import React from 'react';

global.fetch = vi.fn();

describe('App Component', () => {
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('відображає товари, які прийшли з "сервера"', async () => {
    const mockProducts = [
      { id: 1, name: 'Тестовий Хліб', price: 20 },
      { id: 2, name: 'Тестове Молоко', price: 30 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<App />);

    expect(screen.getByText(/Менеджер Товарів/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Тестовий Хліб')).toBeInTheDocument();
      expect(screen.getByText('Тестове Молоко')).toBeInTheDocument();
    });
  });

  it('додає новий товар у список при заповненні форми', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    const nameInput = screen.getByPlaceholderText(/Назва/i);
    const priceInput = screen.getByPlaceholderText(/Ціна/i);
    const addButton = screen.getByText('Додати');

    fireEvent.change(nameInput, { target: { value: 'Новий Сир' } });
    fireEvent.change(priceInput, { target: { value: '150' } });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: 'Новий Сир', price: 150 }),
    });
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 3, name: 'Новий Сир', price: 150 }],
    });

    fireEvent.click(addButton);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/products'), expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Новий Сир')
        }));
    });

    await waitFor(() => {
        expect(nameInput.value).toBe('');
    });
  });
});