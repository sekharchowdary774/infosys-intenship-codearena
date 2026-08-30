import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import InputField from "../components/auth/InputField";
import SubmitButton from "../components/auth/SubmitButton";

import { forgotPassword } from "../api/authApi";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  const handleChange = (e) => {

    setEmail(e.target.value);

    setError("");

    setSuccessMessage("");
  };


  const validate = () => {

    if (!email.trim()) {

      setError("Email is required");

      return false;
    }


    if (!/\S+@\S+\.\S+/.test(email)) {

      setError("Invalid email");

      return false;
    }


    return true;
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validate()) return;


    setLoading(true);

    setError("");

    setSuccessMessage("");


    try {

      await forgotPassword({
        email: email.trim()
      });


      setSuccessMessage(
        "Password reset link has been sent to your email."
      );

      setEmail("");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to send password reset link. Please try again."
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
          value={email}
          onChange={handleChange}
          error={error}
        />


        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}


        <SubmitButton
          text="Send Reset Link"
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

export default ForgotPassword;