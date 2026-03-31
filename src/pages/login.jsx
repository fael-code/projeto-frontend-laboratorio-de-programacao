import { useState } from "react";
import { Link } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/login_style.css";

function Login() {
  const [mostrar, setMostrar] = useState(false);

  return (
    <main className="container">
      <form>
        <h1>Login Screen</h1>
        <div className="input-box-e">
          <input placeholder="User" type="email" />
          <i className="bx bxs-user"></i>
        </div>

        <div className="input-box-p">
          <input
            placeholder="Password"
            type={mostrar ? "text" : "password"}
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

        <button type="submit" className="login">
          Log In
        </button>

        <div>
          <p>
            Don't have an account?
            <Link to="/register">Register...</Link>
          </p>
        </div>
      </form>
    </main>
  );
}

export default Login;