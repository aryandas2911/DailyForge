import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Signup = () => {
  // states for inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // error state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // useNavigate object
  const navigate = useNavigate();

  // useContext for auth
  const { setUser, setToken } = useContext(AuthContext);

  // validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit handler
  const handleSubmit = async (e) => {
    // prevents page from refreshing
    e.preventDefault();
    
    // validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    // send request to server
    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      console.log("Signup success: ", res.data);

      // save token in localstorage for later api calls
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      // get user details
      const me = await api.get("/auth/me");
      setUser(me.data.user);

      // redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // handle error
      console.log("Signup failed");
      console.log(error.response?.data || error.message);
      setErrors({ 
        submit: error.response?.data?.message || "Signup failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // clear field error when user types
  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // signup component
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
        <h1 className="text-3xl font-bold text-main">Signup</h1>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      {/* Name Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-main">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => {
            handleFieldChange("name", e.target.value, setName);
          }}
          placeholder="Full Name"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus hover-lift
            ${errors.name ? "border-red-500 focus:border-red-500" : ""}
          `}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-main">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            handleFieldChange("email", e.target.value, setEmail);
          }}
          placeholder="user@email.com"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-sm
            shadow-xs
            input-focus hover-lift
            ${errors.email ? "border-red-500 focus:border-red-500" : ""}
          `}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-main">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => {
            handleFieldChange("password", e.target.value, setPassword);
            // Clear confirm password error when password changes
            if (errors.confirmPassword) {
              setErrors(prev => ({ ...prev, confirmPassword: "" }));
            }
          }}
          placeholder="••••••••"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-base
            shadow-xs
            input-focus hover-lift
            ${errors.password ? "border-red-500 focus:border-red-500" : ""}
          `}
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-main">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            handleFieldChange("confirmPassword", e.target.value, setConfirmPassword);
          }}
          placeholder="Confirm your password"
          required
          className={`
            w-full px-3 py-2.5
            text-sm
            surface-bg
            border-soft
            rounded-base
            shadow-xs
            input-focus hover-lift
            ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}
          `}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-0.5">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary cursor-pointer w-full mt-2 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Sign Up"
        )}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <span
          onClick={() => {
            navigate("/login");
          }}
          className="text-main font-medium cursor-pointer hover:underline transition-colors"
        >
          Login
        </span>
      </p>
    </form>
  );
};

export default Signup;