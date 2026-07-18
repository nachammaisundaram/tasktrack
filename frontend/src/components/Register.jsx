import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ListTodo } from "lucide-react";
import API from "../api/axiosConfig";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/register", { username, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-2xl p-8">
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-3 shadow-lg">
            <ListTodo size={22} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Create account</h2>
          <p className="text-sm text-neutral-500 mt-1">Start tracking your tasks</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex items-center gap-2 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-3 focus-within:border-orange-500/50">
            <User size={16} className="text-neutral-500 shrink-0" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-transparent outline-none text-sm text-neutral-100 placeholder:text-neutral-600 w-full"
            />
          </div>
          <div className="flex items-center gap-2 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-3 focus-within:border-orange-500/50">
            <Lock size={16} className="text-neutral-500 shrink-0" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent outline-none text-sm text-neutral-100 placeholder:text-neutral-600 w-full"
            />
          </div>

          {error && <p className="text-orange-400 text-xs font-mono">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
