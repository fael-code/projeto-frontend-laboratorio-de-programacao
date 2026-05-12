import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home_style.css";

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  // Estados principais
  const [shoppingLists, setShoppingLists] = useState(() => {
    const savedLists = localStorage.getItem('shopping_lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });
  
  const [purchaseHistory, setPurchaseHistory] = useState(() => {
    const history = localStorage.getItem('purchase_history');
    return history ? JSON.parse(history) : [];
  });

  const [selectedList, setSelectedList] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('list');
  const [editingList, setEditingList] = useState(null);
  
  // Estados de inputs
  const [listName, setListName] = useState("");
  const [listColor, setListColor] = useState("#f28b82");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnit, setItemUnit] = useState("un");
  
  // Catálogo e Controle de Estoque
  const [itensSugeridos, setItensSugeridos] = useState([]);
  const [catalogoGeral, setCatalogoGeral] = useState([]); 
  const [showMarketItems, setShowMarketItems] = useState(false);
  const [marketProducts, setMarketProducts] = useState([]);

  // Modal Nativo de Confirmação
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", action: null });

  const colors = ["#f28b82", "#fbbc04", "#fff475", "#ccff90", "#a7ffeb", "#cbf0f8", "#d7aefb", "#fdcfe8", "#e8eaed"];
  const units = ["un", "kg", "g", "L", "ml", "cx", "pacote", "bandeja"];

  // Efeitos de Proteção e Salvamento
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    localStorage.setItem('shopping_lists', JSON.stringify(shoppingLists));
  }, [shoppingLists]);

  useEffect(() => {
    localStorage.setItem('purchase_history', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  // Sincronização do Catálogo Master
  const atualizarCatalogoGeral = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const resposta = await fetch('http://127.0.0.1:8000/api/shop/produtos/', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCatalogoGeral(dados); 
        const nomesUnicos = [...new Set(dados.map(p => p.nome))];
        setItensSugeridos(nomesUnicos);
        
        // Atualiza a visualização da mini janela, caso seja solicitada
        const itensUnicosDetalhes = dados.filter((item, index, self) => index === self.findIndex((t) => t.nome === item.nome));
        setMarketProducts(itensUnicosDetalhes);
      }
    } catch (erro) { console.error("Falha ao sincronizar menu:", erro); }
  };

  useEffect(() => {
    if (isAuthenticated) atualizarCatalogoGeral();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Funções de Lista (Criar, Editar, Excluir)
  const openNewListModal = () => {
    setModalType('list');
    setEditingList(null);
    setListName("");
    setListColor("#4ade80"); // Verde padrão
    setShowModal(true);
  };

  const openEditListModal = (list) => {
    setModalType('list');
    setEditingList(list);
    setListName(list.name);
    setListColor(list.color);
    setShowModal(true);
  };

  const saveList = () => {
    if (!listName.trim()) return;
    if (editingList) {
      const updatedLists = shoppingLists.map(list =>
        list.id === editingList.id ? { ...list, name: listName, color: listColor, updatedAt: new Date().toISOString() } : list
      );
      setShoppingLists(updatedLists);
      if (selectedList?.id === editingList.id) setSelectedList({ ...selectedList, name: listName, color: listColor });
    } else {
      const newList = { id: Date.now(), name: listName, color: listColor, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setShoppingLists([newList, ...shoppingLists]);
      setSelectedList(newList);
    }
    setShowModal(false);
  };

  const requestDeleteList = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Lista",
      message: "Tem certeza que deseja apagar esta lista permanentemente?",
      action: () => {
        setShoppingLists(shoppingLists.filter(list => list.id !== id));
        if (selectedList?.id === id) setSelectedList(null);
        setConfirmDialog({ isOpen: false });
      }
    });
  };

  // Funções de Itens
  const openNewItemModal = () => {
    if (!selectedList) return;
    setModalType('item');
    setItemName("");
    setItemQuantity(1);
    setItemUnit("un");
    setShowMarketItems(false);
    atualizarCatalogoGeral(); // Garante o estoque mais recente antes de adicionar
    setShowModal(true);
  };

  const saveItem = () => {
    if (!itemName.trim()) return;
    
    // 1. VERIFICAÇÃO DE EXISTÊNCIA NO CATÁLOGO
    const produtoReferencia = catalogoGeral.find(p => p.nome.toLowerCase() === itemName.trim().toLowerCase());
    
    if (!produtoReferencia) { 
      alert("Este item não consta no catálogo oficial. Selecione um item válido."); 
      return; 
    }

    const limiteEstoque = produtoReferencia.estoque;
    
    if (limiteEstoque <= 0) {
      alert(`O estoque de ${produtoReferencia.nome} está completamente zerado no momento.`);
      return;
    }

    // 2. VERIFICA SE O ITEM JÁ ESTÁ NA SUA LISTA ATUAL
    const itemJaNaLista = selectedList.items.find(item => item.id === produtoReferencia.id);

    if (itemJaNaLista) {
      // Se o item já existe, somamos a quantidade nova com a que já estava no carrinho
      const novaQuantidade = itemJaNaLista.quantity + itemQuantity;

      // Verificamos se a soma não ultrapassa o estoque do servidor
      if (novaQuantidade > limiteEstoque) {
        alert(`Alerta de Estoque:  Já possui ${itemJaNaLista.quantity} unidade(s) na lista. Adicionar mais ${itemQuantity} ultrapassa o nosso estoque total de ${limiteEstoque}.`);
        return;
      }

      // Atualiza apenas a quantidade na linha já existente
      const updatedItems = selectedList.items.map(item =>
        item.id === produtoReferencia.id ? { ...item, quantity: novaQuantidade } : item
      );

      const updatedLists = shoppingLists.map(list =>
        list.id === selectedList.id ? { ...list, items: updatedItems } : list
      );

      setShoppingLists(updatedLists);
      setSelectedList({ ...selectedList, items: updatedItems });

    } else {
      // Se O ITEM NÃO ESTÁ NA LISTA, faz a checagem normal e cria uma linha nova
      if (itemQuantity > limiteEstoque) {
        alert(`Alerta de Estoque: Foi solicitado ${itemQuantity}, mas temos apenas ${limiteEstoque} unidade(s) disponíveis.`);
        setItemQuantity(limiteEstoque); // Corrige automaticamente
        return;
      }

      const newItem = { 
        id: produtoReferencia.id, 
        name: produtoReferencia.nome, 
        quantity: itemQuantity, 
        maxStock: limiteEstoque, 
        unit: itemUnit, 
        checked: false, 
        createdAt: new Date().toISOString() 
      };

      const updatedLists = shoppingLists.map(list =>
        list.id === selectedList.id ? { ...list, items: [...list.items, newItem], updatedAt: new Date().toISOString() } : list
      );
      
      setShoppingLists(updatedLists);
      setSelectedList({ ...selectedList, items: [...selectedList.items, newItem] });
    }

    // Fecha o modal após o sucesso
    setShowModal(false);
  };

  const toggleItemCheck = (itemId) => {
    const updatedItems = selectedList.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
    const updatedLists = shoppingLists.map(list => list.id === selectedList.id ? { ...list, items: updatedItems } : list);
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: updatedItems });
  };

  const updateItemQuantity = (itemId, delta) => {
    let bateuNoLimite = false;
    
    const updatedItems = selectedList.items.map(item => {
      if (item.id === itemId) {
        const limite = item.maxStock || 999;
        const novaQtd = item.quantity + delta;
        
        if (novaQtd > limite) {
          bateuNoLimite = true;
          return { ...item, quantity: limite }; // Trava no limite máximo do estoque
        }
        return { ...item, quantity: Math.max(1, novaQtd) }; // Trava no mínimo 1
      }
      return item;
    });

    if (bateuNoLimite) alert("Limite máximo de estoque alcançado para este item.");

    const updatedLists = shoppingLists.map(list => list.id === selectedList.id ? { ...list, items: updatedItems } : list);
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: updatedItems });
  };

  const deleteItem = (itemId, e) => {
    e.stopPropagation();
    const updatedItems = selectedList.items.filter(item => item.id !== itemId);
    const updatedLists = shoppingLists.map(list => list.id === selectedList.id ? { ...list, items: updatedItems } : list);
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: updatedItems });
  };

  // ------------------------------------------------------------------
  // PROTOCOLO DE CONCLUSÃO E DEDUÇÃO DE ESTOQUE (COMUNICAÇÃO FRONT -> BACK)
  // ------------------------------------------------------------------
  const requestFinishPurchase = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Concluir compra",
      message: "Deseja encerrar esta lista? O sistema irá atualizar automaticamente o estoque no banco de dados.",
      action: async () => {
        
        const token = localStorage.getItem('access_token');
        let houveErro = false;

        // Loop de baixa no estoque enviando a ordem para o Django
        for (const item of selectedList.items) {
          const novoEstoque = item.maxStock - item.quantity;

          try {
            const resposta = await fetch(`http://127.0.0.1:8000/api/shop/produtos/${item.id}/`, {
              method: 'PATCH',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ estoque: novoEstoque })
            });

            if (!resposta.ok) throw new Error(`Falha ao atualizar o item ${item.name}`);
            
          } catch (erro) {
            console.error("Erro no PATCH de estoque:", erro);
            houveErro = true;
          }
        }

        if (houveErro) {
          alert("Alerta: A compra foi concluída, mas alguns itens falharam ao sincronizar com o banco de dados. Verifique a conexão.");
        }

        // Arquivamento da Nota Fiscal
        const completedList = { ...selectedList, completedAt: new Date().toISOString() };
        setPurchaseHistory([completedList, ...purchaseHistory]);

        // Limpeza da tela
        const updatedLists = shoppingLists.filter(list => list.id !== selectedList.id);
        setShoppingLists(updatedLists);
        setSelectedList(null);
        setConfirmDialog({ isOpen: false });
        
        // Refaz o scanner para pegar os estoques atualizados para a próxima compra
        atualizarCatalogoGeral();
      }
    });
  };

  const getTotalItems = () => selectedList?.items?.length || 0;
  const getCheckedItems = () => selectedList?.items?.filter(item => item.checked).length || 0;

  return (
    <div className="home-wrapper">
      <nav className="top-nav">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><i className="bx bx-menu"></i></button>
        <h2 className="logo">🛒 Lista de Supermercado</h2>
        <button onClick={handleLogout} className="nav-btn logout-btn"><i className="bx bx-log-out"></i> Sair</button>
      </nav>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Minhas Listas</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}><i className="bx bx-x"></i></button>
        </div>
        <button className="new-list-btn" onClick={openNewListModal}><i className="bx bx-plus"></i> Nova Lista</button>
        <div className="lists-container">
          {shoppingLists.length === 0 ? (
            <div className="empty-lists"><p>Nenhuma lista criada</p></div>
          ) : (
            shoppingLists.map(list => (
              <div key={list.id} className={`list-item ${selectedList?.id === list.id ? 'active' : ''}`} onClick={() => { setSelectedList(list); setSidebarOpen(false); }}>
                <div className="list-color" style={{ backgroundColor: list.color }}></div>
                <div className="list-info"><span className="list-name">{list.name}</span><span className="list-count">{list.items.length} itens</span></div>
                <div className="list-actions">
                  <button className="delete-list-btn" onClick={(e) => { e.stopPropagation(); requestDeleteList(list.id); }}><i className="bx bx-trash"></i></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="home-main">
        <div 
          className="content-box" 
          style={selectedList ? { 
            borderTop: `4px solid ${selectedList.color}`, 
            background: `linear-gradient(180deg, ${selectedList.color}15 0%, rgba(255,255,255,0.02) 100%)` 
          } : {}}
        >
          {!selectedList ? (
            <div className="no-list-selected">
              <i className="bx bx-list-ul"></i>
              <h2>Painel de Controle</h2>
              <p>Selecione uma lista no menu lateral ou inicie um novo protocolo de compras.</p>
              <button className="create-first-list" onClick={openNewListModal}><i className="bx bx-plus"></i> Nova Lista</button>
            </div>
          ) : (
            <>
              <div className="list-header">
                <div className="list-title-section">
                  <div className="list-color-badge" style={{ backgroundColor: selectedList.color }}></div>
                  <h1>{selectedList.name}</h1>
                  <button onClick={() => openEditListModal(selectedList)} className="edit-title-btn" title="Editar Lista"><i className="bx bx-edit"></i></button>
                </div>
                <div className="list-stats">
                  <span className="stats-badge">{getCheckedItems()} / {getTotalItems()} itens</span>
                </div>
              </div>

              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(getTotalItems() === 0 ? 0 : getCheckedItems() / getTotalItems()) * 100}%` }}></div></div>
              
              <div className="items-list">
                {selectedList.items.length === 0 ? (
                  <div className="empty-items"><i className="bx bx-cart-add"></i><p>Lista Vazia</p></div>
                ) : (
                  selectedList.items.map(item => (
                    <div key={item.id} className={`item-card ${item.checked ? 'checked' : ''}`}>
                      <div className="item-check">
                        <input type="checkbox" checked={item.checked} onChange={() => toggleItemCheck(item.id)} />
                      </div>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <div className="item-quantity-controls">
                          <button onClick={() => updateItemQuantity(item.id, -1)} className="qty-btn"><i className='bx bx-minus'></i></button>
                          <span className="item-quantity">{item.quantity} {item.unit}</span>
                          <button onClick={() => updateItemQuantity(item.id, 1)} className="qty-btn"><i className='bx bx-plus'></i></button>
                        </div>
                      </div>
                      <button className="delete-item-btn" onClick={(e) => deleteItem(item.id, e)} title="Excluir Item">
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {selectedList.items.length > 0 && (
                <button 
                  className={`finish-purchase-btn ${getCheckedItems() === getTotalItems() ? 'enabled' : 'disabled'}`} 
                  disabled={getCheckedItems() !== getTotalItems()} 
                  onClick={requestFinishPurchase}
                >
                  <i className="bx bx-check-double"></i> Concluir Compra
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {selectedList && (
        <button className="cart-btn" onClick={openNewItemModal}>
          <i className="bx bx-cart-add"></i><span>Adicionar Item</span>
        </button>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setShowMarketItems(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'list' ? (editingList ? "Editar Lista" : "Nova Lista") : "Adicionar Item"}</h3>
              <button className="close-modal" onClick={() => { setShowModal(false); setShowMarketItems(false); }}>X</button>
            </div>

            {modalType === 'list' ? (
              <>
                <input type="text" placeholder="Nome da lista..." value={listName} onChange={(e) => setListName(e.target.value)} className="list-name-input" autoFocus />
                <div className="color-picker">
                  <label>Cor da lista:</label>
                  <div className="color-options">
                    {colors.map((color) => (
                      <button key={color} className={`color-option ${listColor === color ? "active" : ""}`} style={{ backgroundColor: color }} onClick={() => setListColor(color)} />
                    ))}
                  </div>
                </div>
                <button className="save-btn" onClick={saveList}>{editingList ? "Salvar Alterações" : "Criar Lista"}</button>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                <div className="modal-view form-view" style={{ padding: 0, width: '100%' }}>
                  <div className="input-with-button">
                    <input type="text" list="itens-backend" placeholder="Nome do item..." value={itemName} onChange={(e) => setItemName(e.target.value)} className="item-name-input" autoFocus />
                    <button className="market-menu-btn" onClick={() => setShowMarketItems(true)} type="button" title="Abrir Catálogo"><i className="bx bx-list-ul"></i></button>
                  </div>
                  <datalist id="itens-backend">
                    {itensSugeridos.map((nome, index) => <option key={index} value={nome} />)}
                  </datalist>

                  <div className="quantity-group">
                    <div className="quantity-input">
                      <label>Quantidade:</label>
                      <input type="number" min="1" step="1" value={itemQuantity} onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)} className="quantity-number" />
                    </div>
                    <div className="unit-input">
                      <label>Unidade:</label>
                      <select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}>
                        {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="save-btn" onClick={saveItem}>Adicionar Item</button>
                </div>

                {showMarketItems && (
                  <div className="mini-catalog-overlay">
                    <div className="mini-catalog-content">
                      <div className="mini-catalog-header">
                        <h4>Itens do Mercado</h4>
                        <button onClick={() => setShowMarketItems(false)} className="close-mini-btn">X</button>
                      </div>
                      <div className="market-items-grid">
                        {marketProducts.map(prod => (
                          <button key={prod.id} className="market-suggestion-card" onClick={() => { setItemName(prod.nome); setShowMarketItems(false); }}>
                            {prod.nome}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO NATIVO */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="confirm-dialog-content">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="confirm-dialog-actions">
              <button className="cancel-btn" onClick={() => setConfirmDialog({ isOpen: false })}>Cancelar</button>
              <button className="confirm-btn" onClick={confirmDialog.action}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;