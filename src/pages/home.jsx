import { Link, useNavigate } from "react-router-dom";
import "../styles/home_style.css";

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="home-wrapper">
      {/* Barra de Navegação no Canto Superior Direito */}
      <nav className="top-nav">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="nav-btn logout-btn">
            Desconectar
          </button>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <button className="nav-btn login-btn">Log In</button>
            </Link>
            <Link to="/register" className="nav-link">
              <button className="nav-btn register-btn">Register</button>
            </Link>
          </>
        )}
      </nav>

      {/* Conteúdo Central */}
      <main className="home-main">
        <div className="content-box">
          <h1>Painel Principal</h1>
          <p className={isAuthenticated ? "status online" : "status offline"}>
            {isAuthenticated
              ? "Bem-vindo!"
              : "Acesso restrito. Por favor, realize o login."}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Home;