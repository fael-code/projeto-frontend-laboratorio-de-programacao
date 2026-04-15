import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/login_style.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login realizado com sucesso.");
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        alert("Login realizado com sucesso.");
        navigate('/');
      } else {
        console.error("Falha na autenticação:", data);
        alert("Credenciais inválidas. Verifique seu nome e senha.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Falha de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-wrapper">
        <main className="container">
          <form onSubmit={handleSubmit}>
            <h1>Login Screen</h1>

            <div className="input-box-e">
              <input
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box-p">
              <input
                placeholder="Password"
                type={mostrar ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={mostrar ? "bx bx-show" : "bx bx-hide"}
                onClick={() => setMostrar(!mostrar)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            <div className="lembrar-esquecer">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#">Redefine password?</a>
            </div>

            <button type="submit" className="login" disabled={loading}>
              {loading ? "Entrando..." : "Log In"}
            </button>

            <div>
              <p>
                Don't have an account?
                <Link to="/register">Register...</Link>
              </p>
            </div>
          </form>
        </main>
      </div>
  );
}

export default Login;