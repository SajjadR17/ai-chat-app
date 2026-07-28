import React, { useState } from "react";
import "../styles/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { signup } from "../utils/auth";

function SignupPage() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [emailValue, setEmailValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [passValue, setPassValue] = useState("");
  const [repeatPassValue, setRepeatPassValue] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (password) => {
    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      return "Password is required.";
    }

    if (trimmedPassword.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const validateRepeatPassword = (password, repeatPassword) => {
    const trimmedPassword = password.trim();
    const trimmedRepeatPassword = repeatPassword.trim();

    if (!trimmedRepeatPassword) {
      return "Please repeat your password.";
    }

    if (trimmedPassword !== trimmedRepeatPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const validateUsername = (username) => {
    const value = username.trim();

    if (!value) {
      return "Name is required.";
    }

    if (value.length < 3) {
      return "Name must be at least 3 characters.";
    }

    if (value.length > 50) {
      return "Name must be less than 50 characters.";
    }

    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return "Name can only contain English letters and spaces.";
    }

    if (/\s{2,}/.test(value)) {
      return "Name cannot contain multiple spaces.";
    }

    return "";
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const email = emailValue.trim();
    const username = usernameValue.trim();
    const password = passValue.trim();
    const repeatPassword = repeatPassValue.trim();

    const emailErr = validateEmail(email);
    const usernameErr = validateUsername(username);
    const passErr = validatePassword(password);
    const repeatPassErr = validateRepeatPassword(password, repeatPassword);

    if (emailErr || passErr || repeatPassErr || usernameErr) {
      setErrors({
        emailErr,
        passErr,
        repeatPassErr,
        usernameErr,
      });

      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signup(email, password, username);
      navigate("/chat/new");
    } catch (err) {
      const newErrors = {};

      switch (err.code) {
        case "auth/email-already-in-use":
          newErrors.emailErr = "An account with this email already exists.";
          break;

        case "auth/invalid-email":
          newErrors.emailErr = "Invalid email address.";
          break;

        case "auth/weak-password":
          newErrors.passErr = "Password should be at least 6 characters.";
          break;

        case "auth/network-request-failed":
          newErrors.generalErr =
            "Network error. Check your internet connection.";
          break;

        case "auth/too-many-requests":
          newErrors.generalErr = "Too many requests. Please try again later.";
          break;

        default:
          newErrors.generalErr = "Failed to create account.";
          console.error(err);
      }

      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={submitHandler} className="auth-form">
        <div className="auth-title">
          <div className="auth-title-dot"></div>
          <h2>Sign Up</h2>
        </div>

        <div className="general-err-container">{errors.generalErr}</div>

        <div className="auth-inputs">
          <div className="input-container">
            <label htmlFor="username" className="mono">
              Name
            </label>
            <input
              type="text"
              value={usernameValue}
              id="username"
              onChange={(e) => {
                const value = e.target.value;
                setUsernameValue(value);
                setErrors((prev) => ({
                  ...prev,
                  usernameErr: validateUsername(value),
                  generalErr: "",
                }));
              }}
              placeholder="Enter your name"
              autoComplete="name"
            />
            <span className="input-err mono">{errors.usernameErr}</span>
          </div>

          <div className="input-container">
            <label htmlFor="email" className="mono">
              Email
            </label>
            <input
              type="email"
              value={emailValue}
              id="email"
              onChange={(e) => {
                const value = e.target.value;
                setEmailValue(value);
                setErrors((prev) => ({
                  ...prev,
                  emailErr: validateEmail(value),
                  generalErr: "",
                }));
              }}
              placeholder="Enter your email"
              autoComplete="email"
            />
            <span className="input-err mono">{errors.emailErr}</span>
          </div>

          <div className="input-container">
            <label htmlFor="password" className="mono">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={passValue}
              onChange={(e) => {
                const value = e.target.value;
                setPassValue(value);
                setErrors((prev) => ({
                  ...prev,
                  passErr: validatePassword(value),
                  repeatPassErr: validateRepeatPassword(value, repeatPassValue),
                  generalErr: "",
                }));
              }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <span className="input-err mono">{errors.passErr}</span>
          </div>

          <div className="input-container">
            <label htmlFor="repeat-password" className="mono">
              Repeat Password
            </label>
            <input
              type="password"
              id="repeat-password"
              value={repeatPassValue}
              onChange={(e) => {
                const value = e.target.value;
                setRepeatPassValue(value);
                setErrors((prev) => ({
                  ...prev,
                  repeatPassErr: validateRepeatPassword(passValue, value),
                  generalErr: "",
                }));
              }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <span className="input-err mono">{errors.repeatPassErr}</span>
          </div>
        </div>

        <Link to="/login" className="auth-form-quick-link mono">
          Have an account? Login
        </Link>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? <ClipLoader size={15} /> : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignupPage;
