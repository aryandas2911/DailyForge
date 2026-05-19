import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";


const Login = () => {
  // two states for inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  // state to control visibility of the signup prompt modal
  const [showSignupModal, setShowSignupModal] = useState(false); 
  // useNavigate object
  const navigate = useNavigate();

  // useContext for auth
  const { setUser } = useContext(AuthContext);

  // submit handler
  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();

    // send request to server
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login success: ", res.data);

      // get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // handle error
      console.log("Login failed");
      console.log(error.response?.data || error.message);
      const message = error.response?.data?.message || "Invalid email or password.";

      // if user does not exist, show signup prompt modal instead of inline error
      // all other errors (wrong password, missing fields, server error) show inline as before
      if (message === "User does not exist") {
        setShowSignupModal(true);
      } else {
        setError(message);
      }
    }
  };

  // login component
  return (
    <>
    {/* Signup prompt modal ; triggered when backend returns "User does not exist"
          clicking backdrop or Cancel dismisses it, Go to Sign Up navigates to /signup */}
      {showSignupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowSignupModal(false)}
        >
          <div
            className="surface-bg rounded-2xl px-8 py-8 w-full max-w-sm flex flex-col gap-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-main">Account Not Found</h2>
              <p className="text-sm text-muted">
                No account exists for{" "}
                <span className="font-medium text-main">{email}</span>.
              </p>
            </div>
            <p className="text-sm text-center text-muted">
              Would you like to create one?
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="btn btn-primary cursor-pointer w-full hover-lift"
            >
              Go to Sign Up
            </button>
            <button
              onClick={() => setShowSignupModal(false)}
              className="text-sm text-center text-muted hover:text-main transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    <form
      className="
        surface-bg px-10 py-15 rounded-2xl
        w-full max-w-sm
        flex flex-col gap-6 animate-in
      "
      onSubmit={handleSubmit}
    >
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-3xl font-bold text-main">Login</h1>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-main">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="user@email.com"
          required
          className="
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus
            hover-lift
          "
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-main">
          Password
        </label>
        <div className="relative">

          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="••••••••"
            required
            className="
              w-full px-3 py-2.5 pr-10
              text-sm
              surface-bg
              border-soft
              rounded-base
              shadow-xs
              input-focus
              hover-lift
            "
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors cursor-pointer flex items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary cursor-pointer w-full mt-2 hover-lift"
      >
        Login
      </button>

      <p className="text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-main font-medium cursor-pointer hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
    </>
  );
};

export default Login;
