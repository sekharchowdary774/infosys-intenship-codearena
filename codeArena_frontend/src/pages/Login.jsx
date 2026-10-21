import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import InputField from "../components/auth/InputField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";

import { loginUser } from "../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));

    setServerError("");
  };


  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });


      // =========================
      // STORE AUTH DATA
      // =========================

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "email",
        formData.email
      );


      // =========================
      // STORE USERNAME
      // =========================

      if (response.username) {

        localStorage.setItem(
          "username",
          response.username
        );

      } else {

        localStorage.setItem(
          "username",
          formData.email.split("@")[0]
        );
      }


      // =========================
      // STORE ROLE
      // =========================

      localStorage.setItem(
        "role",
        response.role
      );


      // =========================
      // ROLE BASED REDIRECT
      // =========================

      if (response.role === "ADMIN") {

        navigate("/admin");

      } else {

        navigate("/users");
      }


    } catch (error) {

      setServerError(
        error.response?.data?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <AuthLayout>

      <AuthHeader />

      <form onSubmit={handleSubmit}>

        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />


        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <div className="forgot-password">
          <Link to="/forgot-password">
          Forgot Password?
          </Link>
        </div>


        {serverError && (
          <div className="auth-error">
            {serverError}
          </div>
        )}


        <SubmitButton
          text="Login"
          loading={loading}
        />

      </form>


      <div className="auth-footer">

        Don't have an account?{" "}

        <Link to="/register">
          Register
        </Link>

      </div>

    </AuthLayout>
  );
}

export default Login;