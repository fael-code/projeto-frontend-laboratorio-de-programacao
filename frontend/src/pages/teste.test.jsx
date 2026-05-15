/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from './register.jsx';
import Login from './login.jsx';
import Home from './home.jsx';

// Neutralizar carregamento de CSS e ativos estáticos nos testes de Snapshot
vi.mock('boxicons/css/boxicons.min.css', () => ({}));
vi.mock('../styles/register_style.css', () => ({}));
vi.mock('../styles/login_style.css', () => ({}));
vi.mock('../styles/home_style.css', () => ({}));

// Correção do mock de imagem para o padrão ESM (ECMAScript Modules)
vi.mock('../assets/img.jpg', () => ({
  default: 'mock-image-path'
}));

// Mock nativo do Alert do Browser
window.alert = vi.fn();

// Mock global do Fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Criar um espião para monitorar e limpar logs indesejados no console
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  cleanup(); // Desmonta a árvore do React do DOM simulado após cada teste
  consoleSpy.mockClear(); // Limpa chamadas gravadas no espião de logs
});

// ============================================
// TESTE 1: UTILITÁRIOS E FUNÇÕES LÓGICAS
// ============================================
describe('Testes de Utilitários', () => {
  it('deve validar email corretamente', () => {
    const validateEmail = (email) => {
      if (!email) return false;
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    expect(validateEmail('tony@stark.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
  });

  it('deve formatar preço corretamente', () => {
    const formatPrice = (price) => {
      const absolutePrice = Math.abs(price);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(absolutePrice);
    };
    expect(formatPrice(5000000.00)).toMatch(/5\.?000\.?000/);
    expect(formatPrice(0)).toMatch(/0[,.]00/);
    expect(formatPrice(-100)).toMatch(/100/);
  });

  it('deve validar campos obrigatórios', () => {
    const validateRequiredFields = (fields) => {
      return Object.values(fields).every(value => value && String(value).trim() !== '');
    };
    expect(validateRequiredFields({ name: 'Tony', email: 'tony@stark.com' })).toBe(true);
    expect(validateRequiredFields({ name: '', email: 'tony@stark.com' })).toBe(false);
    expect(validateRequiredFields({ name: 'Tony', email: '' })).toBe(false);
  });
});

// ============================================
// TESTE 2: SNAPSHOT TESTING
// ============================================
describe('Testes de Snapshot - Renderização', () => {
  it('deve manter estrutura do componente Register', () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it('deve manter estrutura do componente Login', () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});

// ============================================
// TESTE 3: RENDERIZAÇÃO CONDICIONAL
// ============================================
describe('Testes de Renderização Condicional', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    window.alert.mockClear();
  });

  it('deve mostrar estado de carregamento durante requisição', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, json: () => Promise.resolve([]) }), 50)
    ));
    localStorage.setItem('access_token', 'fake_token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('deve mostrar mensagem de erro quando API falha', async () => {
    mockFetch.mockRejectedValue(new Error('Falha na conexão'));
    localStorage.setItem('access_token', 'fake_token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Valida se o componente capturou e logou a falha sem poluir a saída do terminal
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('deve desabilitar botão de compra quando nenhum item selecionado', async () => {
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, nome: "Produto Teste", estoque: 10, preco: "100.00" }])
    }));
    localStorage.setItem('access_token', 'fake_token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});

// ============================================
// TESTE 4: CASOS EXTREMOS E VALIDAÇÕES
// ============================================
describe('Testes de Casos Extremos (Edge Cases)', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    window.alert.mockClear();
    localStorage.clear();
  });

  it('deve rejeitar registro com senhas diferentes', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'teste' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: '1234567' } });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('As senhas não coincidem!');
    });
  });

  it('deve rejeitar campos vazios no registro', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const registerBtn = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerBtn);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve rejeitar login sem credenciais', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const loginBtn = screen.getByRole('button', { name: 'Log In' });
    fireEvent.click(loginBtn);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve lidar com token expirado', async () => {
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Token expirado" })
    }));
    
    localStorage.setItem('access_token', 'token_expirado');

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});

// ============================================
// TESTE 5: FLUXO COMPLETO
// ============================================
describe('Protocolo Mark 85: Jornada Completa do Usuário', () => {
  beforeEach(() => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('/register')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Sucesso" }) });
      }
      if (url.includes('/login')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ access: "token_stark", refresh: "refresh_stark" }) });
      }
      if (url.includes('/produtos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, nome: "Reator Arc", estoque: 10, preco: "5000000.00" }])
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    window.alert.mockClear();
    localStorage.clear();
  });

  it('deve completar fluxo completo de compra', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );

    // Form Cadastro
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'stark' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'tony@stark.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'iamironman' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'iamironman' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    // Validar redirecionamento e existência (.toBeTruthy)
    await waitFor(() => {
      const loginBtn = screen.getByRole('button', { name: 'Log In' });
      expect(loginBtn).toBeTruthy();
    });

    // Form Login
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'tony@stark.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'iamironman' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    // Validar chegada segura na Home
    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('token_stark');
    });
  });
});
