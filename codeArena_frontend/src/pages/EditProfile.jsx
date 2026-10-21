import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import InputField from "../components/auth/InputField";
import SubmitButton from "../components/auth/SubmitButton";

import api from "../services/axios";

function EditProfile() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const response =
          await api.get("/users/me");

        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
        });

      } catch (error) {

        console.error(
          "Failed to load profile:",
          error
        );

        setServerError(
          error.response?.data?.message ||
          "Unable to load profile."
        );

      } finally {

        setLoading(false);
      }
    };


    loadProfile();

  }, []);


  // =====================================================
  // HANDLE CHANGE
  // =====================================================

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


  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {

    const newErrors = {};


    if (!formData.username.trim()) {

      newErrors.username =
        "Username is required";

    } else if (formData.username.trim().length < 3) {

      newErrors.username =
        "Username must contain at least 3 characters";
    }


    if (!formData.email.trim()) {

      newErrors.email =
        "Email is required";

    } else if (
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {

      newErrors.email =
        "Invalid email";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validate()) return;


    setSaving(true);
    setServerError("");
    setSuccessMessage("");


    try {

      const response =
        await api.put(
          "/users/me",
          {
            username:
              formData.username.trim(),

            email:
              formData.email.trim(),
          }
        );


      const updatedUser =
        response.data;


      // Update local storage

      localStorage.setItem(
        "username",
        updatedUser.username
      );

      localStorage.setItem(
        "email",
        updatedUser.email
      );


      setFormData({
        username:
          updatedUser.username,

        email:
          updatedUser.email,
      });


      setSuccessMessage(
        "Profile updated successfully."
      );


      setTimeout(() => {

        navigate("/users");

      }, 1000);


    } catch (error) {

      setServerError(
        error.response?.data?.message ||
        "Unable to update profile."
      );

    } finally {

      setSaving(false);
    }
  };


  // =====================================================
  // UI
  // =====================================================

  if (loading) {

    return (
      <AuthLayout>

        <AuthHeader />

        <div className="auth-footer">
          Loading profile...
        </div>

      </AuthLayout>
    );
  }


  return (
    <AuthLayout>

      <AuthHeader />

      <form onSubmit={handleSubmit}>

        <InputField
          label="Username"
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />


        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
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
          text="Save Changes"
          loading={saving}
        />

      </form>


      <div className="auth-footer">

        <Link to="/users">
          Cancel
        </Link>

      </div>

    </AuthLayout>
  );
}

export default EditProfile;