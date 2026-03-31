import { useState } from "react";
import "boxicons/css/boxicons.min.css";
import "../styles/register_style.css";
import { Link } from "react-router-dom";
import img from "../assets/img.jpg";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  /*Verificar se as senhas são iguais*/ 
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    
    const userData = {
      username,
      email,
      password
    };
    
    console.log("Dados do registro:", userData);
  };

  return (
    <main className="r_container">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>

        {/* Campo de NOME DE USUÁRIO */}
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

        {/* Campo de EMAIL */}
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

        {/* Campo de SENHA */}
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

        {/* Campo de CONFIRMAR SENHA */}
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

        <button type="submit" className="register">
          Register
        </button>

        <div>
          <p>
            I have an account! 
            <Link to="/login">  Log In...</Link>
          </p>
        </div>
      </form>
    </main>
  );
}

export default Register;