import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from './register'; // Ajuste o caminho se necessário
import Login from './login';       // Ajuste o caminho se necessário
import Home from './home';         // Ajuste o caminho se necessário

// JARVIS: Interceptador de Alertas (Impede que o window.alert trave o teste)
window.alert = vi.fn();

// JARVIS: Construindo o Holograma do Servidor
global.fetch = vi.fn((url, options) => {
  // Simulação da rota de Registro
  if (url.includes('/register')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Sucesso" }) });
  }
  
  // Simulação da rota de Login
  if (url.includes('/login')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ access: "token_stark", refresh: "refresh_stark" }) });
  }
  
  // Simulação de Busca do Catálogo (Home.jsx)
  if (url.includes('/produtos') && (!options || options.method === 'GET')) {
    return Promise.resolve({ 
      ok: true, 
      json: () => Promise.resolve([{ id: 1, nome: "Reator Arc", estoque: 10, preco: "5000000.00" }]) 
    });
  }

  // Simulação de Baixa no Estoque (Home.jsx - Finalizar Compra)
  if (url.includes('/produtos') && options?.method === 'PATCH') {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }

  return Promise.reject(new Error(`Rota não mapeada no teste: ${url}`));
});

describe('Protocolo Mark 85: Jornada Completa do Usuário', () => {
  
  beforeEach(() => {
    fetch.mockClear();
    window.alert.mockClear();
    localStorage.clear(); // Limpa o cache entre os testes
  });

  it('deve registrar, logar, criar lista, adicionar item e concluir a compra', async () => {
    
    // 1. LIGANDO O SISTEMA (Iniciando na tela de Registro)
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );

    // ---------------------------------------------------------
    // FASE 2: REGISTRO
    // ---------------------------------------------------------
    // O seu placeholder no register.jsx é "Username", "Email", etc.
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'tony_stark' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'tony@stark.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'mark85' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'mark85' } });
    
    // Clica no botão "Register"
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Aguarda o alerta de sucesso e o redirecionamento para o login
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('sucesso')));

    // ---------------------------------------------------------
    // FASE 3: LOGIN
    // ---------------------------------------------------------
    // No seu login.jsx, o placeholder atual é "Username", mas mapeia pro email
    await waitFor(() => expect(screen.getByText('Login Screen')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'tony@stark.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'mark85' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    // ---------------------------------------------------------
    // FASE 4: PAINEL PRINCIPAL (HOME) E NOVA LISTA
    // ---------------------------------------------------------
    // Aguarda a Home carregar (identificado pelo título)
    await waitFor(() => expect(screen.getByText('Painel de Controle')).toBeInTheDocument());

    // Clica para criar Nova Lista (O botão da área vazia)
    fireEvent.click(screen.getByRole('button', { name: /Nova Lista/i }));
    
    // Preenche o modal de lista
    await waitFor(() => expect(screen.getByPlaceholderText('Nome da lista...')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Nome da lista...'), { target: { value: 'Suprimentos da Armadura' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar Lista/i }));

    // ---------------------------------------------------------
    // FASE 5: ADICIONAR PRODUTO NA LISTA
    // ---------------------------------------------------------
    // Clica no botão flutuante de carrinho
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Item/i }));

    // Preenche o nome exato do produto que mockamos lá em cima no catálogo ("Reator Arc")
    await waitFor(() => expect(screen.getByPlaceholderText('Nome do item...')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Nome do item...'), { target: { value: 'Reator Arc' } });
    
    // Confirma a adição do item
    // Note: usamos getByText porque há outro botão com ícone de lista
    const saveItemBtn = screen.getByText('Adicionar Item', { selector: 'button.save-btn' });
    fireEvent.click(saveItemBtn);

    // ---------------------------------------------------------
    // FASE 6: CONCLUIR COMPRA
    // ---------------------------------------------------------
    // O item deve aparecer na tela. Precisamos marcá-lo no checkbox para habilitar a compra
    await waitFor(() => expect(screen.getByText('Reator Arc')).toBeInTheDocument());
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Agora o botão de concluir deve estar habilitado
    const finishBtn = screen.getByRole('button', { name: /Concluir Compra/i });
    expect(finishBtn).not.toBeDisabled();
    fireEvent.click(finishBtn);

    // ---------------------------------------------------------
    // FASE 7: CONFIRMAÇÃO DO MODAL
    // ---------------------------------------------------------
    await waitFor(() => expect(screen.getByText('Confirmar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Confirmar'));

    // Verifica se o painel vazio voltou (indicando que a lista foi concluída e arquivada)
    await waitFor(() => expect(screen.getByText('Painel de Controle')).toBeInTheDocument());
  });
});