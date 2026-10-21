import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";

import { resetPassword } from "../api/authApi";

function ResetPassword() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");


  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });


  const [errors, setErrors] = useState({});

  const [serverError, setServerError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(false);


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

    setSuccessMessage("");
  };


  const validate = () => {

    const newErrors = {};


    if (!token) {

      setServerError(
        "Invalid or missing password reset link."
      );

      return false;
    }


    if (!formData.password) {

      newErrors.password =
        "Password is required";

    } else if (formData.password.length < 8) {

      newErrors.password =
        "Minimum 8 characters";
    }


    if (!formData.confirmPassword) {

      newErrors.confirmPassword =
        "Confirm your password";

    } else if (
      formData.password !==
      formData.confirmPassword
    ) {

      newErrors.confirmPassword =
        "Passwords do not match";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!validate()) return;


    setLoading(true);

    setServerError("");

    setSuccessMessage("");


    try {

      await resetPassword({

        token: token,

        newPassword:
          formData.password,
      });


      setSuccessMessage(
        "Password reset successfully. Redirecting to login..."
      );


      setFormData({
        password: "",
        confirmPassword: "",
      });


      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      setServerError(
        error.response?.data?.message ||
        "Invalid or expired reset link."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <AuthLayout>

      <AuthHeader />


      <form onSubmit={handleSubmit}>

        <PasswordField
          label="New Password"
          name="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />


        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />


        {serverError && (
          <div className="auth-error">
            {serverError}
          </div>
        )}


        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}


        <SubmitButton
          text="Reset Password"
          loading={loading}
        />

      </form>


      <div className="auth-footer">

        Remember your password?{" "}

        <Link to="/login">
          Login
        </Link>

      </div>

    </AuthLayout>
  );
}

export default ResetPassword;