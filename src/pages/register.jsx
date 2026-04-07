import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/register_style.css";
import img from "../assets/img.jpg";

function Register() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          password_confirm: confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Usuário cadastrado com sucesso.");
        alert("Usuário cadastrado com sucesso. Redirecionando para a tela de login...");
        navigate('/login');
      } else {
        console.error("Falha ao cadastrar usuário. Motivo:", data);
        const errorMessages = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n');
        alert("Acesso negado:\n" + errorMessages);
      }
    } catch (error) {
      console.error("Servidor não está funcionando:", error);
      alert("Falha de comunicação com o servidor. Verifique se o backend está rodando em http://127.0.0.1:8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="r_container">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>

        <div className="input-box-username-r">
          <input
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <i className="bx bxs-user"></i>
        </div>

        <div className="input-box-email-r">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="bx bxs-envelope"></i>
        </div>

        <div className="input-box-password-r">
          <input
            placeholder="Password"
            type={mostrarSenha ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i
            className={mostrarSenha ? "bx bx-show" : "bx bx-hide"}
            onClick={() => setMostrarSenha(!mostrarSenha)}
            style={{ cursor: "pointer" }}
          ></i>
        </div>

        <div className="input-box-confirm-password">
          <input
            placeholder="Confirm Password"
            type={mostrarConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <i
            className={mostrarConfirm ? "bx bx-show" : "bx bx-hide"}
            onClick={() => setMostrarConfirm(!mostrarConfirm)}
            style={{ cursor: "pointer" }}
          ></i>
        </div>

        <button type="submit" className="register" disabled={loading}>
          {loading ? "Cadastrando..." : "Register"}
        </button>

        <div>
          <p>
            I have an account! 
            <Link to="/login"> Log In...</Link>
          </p>
        </div>
      </form>
    </main>
  );
}

export default Register;