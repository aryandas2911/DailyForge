import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Signup = () => {
  // input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // navigation
  const navigate = useNavigate();

  // auth context
  const { setUser, setToken } = useContext(AuthContext);

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // signup request
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      // save token
      localStorage.setItem("token", res.data.token);

      // save token in context
      setToken(res.data.token);

      // get logged in user details
      const me = await api.get("/auth/me");

      // save user in context
      setUser(me.data.user);

      // redirect
      navigate("/dashboard");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message || "Signup failed"
      );
    }
  };

  return (
    <form
      className="
        surface-bg px-10 py-15 rounded-2xl
        w-full max-w-sm
        flex flex-col gap-6
        animate-in
      "
      onSubmit={handleSubmit}
    >
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-3xl font-bold text-main">
          Signup
        </h1>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium text-main"
        >
          Name
        </label>

        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          className="
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus hover-lift
          "
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-main"
        >
          Email
        </label>

        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@email.com"
          required
          className="
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus hover-lift
          "
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-main"
        >
          Password
        </label>

        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-base
            shadow-xs
            input-focus hover-lift
          "
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="
          btn btn-primary
          cursor-pointer
          w-full mt-2
          hover-lift
        "
      >
        Sign Up
      </button>

      {/* Login Redirect */}
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="
            text-main
            font-medium
            cursor-pointer
            hover:underline
            transition-colors
          "
        >
          Login
        </span>
      </p>
    </form>
  );
};

export default Signup;