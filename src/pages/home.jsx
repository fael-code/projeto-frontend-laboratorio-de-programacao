import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home_style.css";

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  // Estado das listas de compras

  const [shoppingLists, setShoppingLists] = useState(() => {
    const savedLists = localStorage.getItem('shopping_lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });
  
  const [selectedList, setSelectedList] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('list');
  const [editingList, setEditingList] = useState(null);
  
  // Estados do formulário de lista

  const [listName, setListName] = useState("");
  const [listColor, setListColor] = useState("#f28b82");
  
  // Estados do formulário de item

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnit, setItemUnit] = useState("un");
  
  // Cores para as listas

  const colors = [
    "#f28b82", "#fbbc04", "#fff475", "#ccff90", 
    "#a7ffeb", "#cbf0f8", "#d7aefb", "#fdcfe8", "#e8eaed"
  ];

  // Unidades de medida

  const units = ["un", "kg", "g", "L", "ml", "cx", "pacote", "bandeja"];

  // Proteção de rota

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Salvar listas no localStorage

  useEffect(() => {
    localStorage.setItem('shopping_lists', JSON.stringify(shoppingLists));
  }, [shoppingLists]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Listas

  const openNewListModal = () => {
    setModalType('list');
    setEditingList(null);
    setListName("");
    setListColor("#f28b82");
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
        list.id === editingList.id
          ? { ...list, name: listName, color: listColor, updatedAt: new Date().toISOString() }
          : list
      );
      setShoppingLists(updatedLists);
      if (selectedList?.id === editingList.id) {
        setSelectedList({ ...selectedList, name: listName, color: listColor });
      }
    } else {
      const newList = {
        id: Date.now(),
        name: listName,
        color: listColor,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setShoppingLists([newList, ...shoppingLists]);
    }
    setShowModal(false);
  };

  const deleteList = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta lista?")) {
      setShoppingLists(shoppingLists.filter(list => list.id !== id));
      if (selectedList?.id === id) {
        setSelectedList(null);
      }
    }
  };

  //Funções dos itens

  const openNewItemModal = () => {
    if (!selectedList) {
      alert("Selecione uma lista primeiro!");
      return;
    }
    setModalType('item');
    setItemName("");
    setItemQuantity(1);
    setItemUnit("un");
    setShowModal(true);
  };

  const saveItem = () => {
    if (!itemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: itemName,
      quantity: itemQuantity,
      unit: itemUnit,
      checked: false,
      createdAt: new Date().toISOString()
    };

    const updatedLists = shoppingLists.map(list =>
      list.id === selectedList.id
        ? { ...list, items: [...list.items, newItem], updatedAt: new Date().toISOString() }
        : list
    );
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: [...selectedList.items, newItem] });
    setShowModal(false);
  };

  const toggleItemCheck = (itemId) => {
    const updatedItems = selectedList.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    
    const updatedLists = shoppingLists.map(list =>
      list.id === selectedList.id
        ? { ...list, items: updatedItems }
        : list
    );
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: updatedItems });
  };

  const deleteItem = (itemId) => {
    const updatedItems = selectedList.items.filter(item => item.id !== itemId);
    
    const updatedLists = shoppingLists.map(list =>
      list.id === selectedList.id
        ? { ...list, items: updatedItems }
        : list
    );
    setShoppingLists(updatedLists);
    setSelectedList({ ...selectedList, items: updatedItems });
  };

  const getTotalItems = () => {
    if (!selectedList) return 0;
    return selectedList.items.length;
  };

  const getCheckedItems = () => {
    if (!selectedList) return 0;
    return selectedList.items.filter(item => item.checked).length;
  };

  return (
    <div className="home-wrapper">

      {/* Barra de Navegação Superior*/ }

      <nav className="top-nav">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className="bx bx-menu"></i>
        </button>
        <div className="nav-left">
          <h2 className="logo">🛒 Lista de Supermercado</h2>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout} className="nav-btn logout-btn">
            <i className="bx bx-log-out"></i> Sair
          </button>
        </div>
      </nav>

      {/* Sidebar */}

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Minhas Listas</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <i className="bx bx-x"></i>
          </button>
        </div>
        
        <button className="new-list-btn" onClick={openNewListModal}>
          <i className="bx bx-plus"></i> Nova Lista
        </button>

        <div className="lists-container">
          {shoppingLists.length === 0 ? (
            <div className="empty-lists">
              <p>Nenhuma lista criada</p>
              <p className="empty-subtitle">Clique em "Nova Lista" para começar</p>
            </div>
          ) : (
            shoppingLists.map(list => (
              <div
                key={list.id}
                className={`list-item ${selectedList?.id === list.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedList(list);
                  setSidebarOpen(false);
                }}
              >
                <div className="list-color" style={{ backgroundColor: list.color }}></div>
                <div className="list-info">
                  <span className="list-name">{list.name}</span>
                  <span className="list-count">{list.items.length} itens</span>
                </div>
                <div className="list-actions">
                  <button
                    className="edit-list-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditListModal(list);
                    }}
                  >
                    <i className="bx bx-edit"></i>
                  </button>
                  <button
                    className="delete-list-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list.id);
                    }}
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay da Sidebar */}

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Conteúdo Principal */}

      <main className="home-main">
        <div className="content-box">
          {!selectedList ? (
            <div className="no-list-selected">
              <i className="bx bx-list-ul"></i>
              <h2>Nenhuma lista selecionada</h2>
              <p>Selecione uma lista no menu lateral ou crie uma nova lista</p>
              <button className="create-first-list" onClick={openNewListModal}>
                <i className="bx bx-plus"></i> Criar minha primeira lista
              </button>
            </div>
          ) : (
            <>
              <div className="list-header">
                <div className="list-title-section">
                  <div className="list-color-badge" style={{ backgroundColor: selectedList.color }}></div>
                  <h1>{selectedList.name}</h1>
                </div>
                <div className="list-stats">
                  <span className="stats-badge">
                    {getCheckedItems()} / {getTotalItems()} itens comprados
                  </span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(getCheckedItems() / getTotalItems()) * 100}%` }}
                ></div>
              </div>

              <div className="items-list">
                {selectedList.items.length === 0 ? (
                  <div className="empty-items">
                    <i className="bx bx-cart-add"></i>
                    <p>Sua lista está vazia</p>
                    <p className="empty-subtitle">Clique no botão do carrinho para adicionar itens</p>
                  </div>
                ) : (
                  selectedList.items.map(item => (
                    <div key={item.id} className={`item-card ${item.checked ? 'checked' : ''}`}>
                      <div className="item-check">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItemCheck(item.id)}
                        />
                      </div>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <button
                        className="delete-item-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Botão do Carrinho */}

      {selectedList && (
        <button className="cart-btn" onClick={openNewItemModal}>
          <i className="bx bx-cart-add"></i>
          <span>Adicionar Item</span>
        </button>
      )}

      {/* Criar/Editar Lista ou Item */}
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'list' 
                  ? (editingList ? "Editar Lista" : "Nova Lista")
                  : "Adicionar Item"}
              </h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <i className="bx bx-x"></i>
              </button>
            </div>

            {modalType === 'list' ? (
              <>
                <input
                  type="text"
                  placeholder="Nome da lista (ex: Mercado, Feira, Farmácia...)"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="list-name-input"
                  autoFocus
                />
                
                <div className="color-picker">
                  <label>Cor da lista:</label>
                  <div className="color-options">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`color-option ${listColor === color ? "active" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setListColor(color)}
                      />
                    ))}
                  </div>
                </div>
                
                <button className="save-btn" onClick={saveList}>
                  {editingList ? "Salvar Alterações" : "Criar Lista"}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nome do item (ex: Arroz, Leite, Pão...)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="item-name-input"
                  autoFocus
                />
                
                <div className="quantity-group">
                  <div className="quantity-input">
                    <label>Quantidade:</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseFloat(e.target.value))}
                      className="quantity-number"
                    />
                  </div>
                  
                  <div className="unit-input">
                    <label>Unidade:</label>
                    <select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button className="save-btn" onClick={saveItem}>
                  Adicionar Item
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;