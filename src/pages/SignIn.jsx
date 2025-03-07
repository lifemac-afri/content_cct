/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authstore";
import { side } from "../assets";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignIn = () => {
  const { login, logout, user, error, loading, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);

      // Check if there's an error in the store after login attempt
      const currentError = useAuthStore.getState().error;
      if (currentError) {
        throw new Error(currentError);
      }

      toast.success("Login successful!");

      // Redirect to console page
      navigate("/console");
    } catch (err) {
      // Handle specific error cases
      const errorMessage = err.message.toLowerCase();
      if (errorMessage.includes("invalid credentials")) {
        toast.error("Invalid email or password");
      } else if (errorMessage.includes("network")) {
        toast.error("Network error. Please check your connection");
      } else {
        toast.error(err.message || "Login failed. Please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen items-center">
      {/* Left Side with Image */}
      <div className="bg-dark_green hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
        <img
          src={side}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side with Login Form */}
      <div className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
        <div className="w-full h-100">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
            Log in to your account
          </h1>

          <form className="mt-6" onSubmit={handleLogin}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="Enter Email Address"
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-primary_green focus:bg-white focus:outline-none"
                autoFocus
                autoComplete="email"
                required
                name="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                minLength="6"
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-primary_green focus:bg-white focus:outline-none"
                required
                name="password"
                disabled={isSubmitting}
              />
            </div>

            <div className="text-right mt-2">
              <a
                href="#"
                className="text-sm font-semibold text-gray-700 hover:text-dark_green focus:text-dark_green"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-primary_green hover:bg-dark_green focus:bg-dark_green text-white font-semibold rounded-lg px-4 py-3 mt-6 "
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <hr className="my-6 border-gray-300 w-full" />

          <button
            type="button"
            className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300"
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="w-6 h-6"
                viewBox="0 0 48 48"
              >
                <defs>
                  <path
                    id="a"
                    d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                  />
                </defs>
                <clipPath id="b">
                  <use xlinkHref="#a" overflow="visible" />
                </clipPath>
                <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
                <path
                  clipPath="url(#b)"
                  fill="#EA4335"
                  d="M0 11l17 13 7-6.1L48 14V0H0z"
                />
                <path
                  clipPath="url(#b)"
                  fill="#34A853"
                  d="M0 37l30-23 7.9 1L48 0v48H0z"
                />
                <path
                  clipPath="url(#b)"
                  fill="#4285F4"
                  d="M48 48L17 24l-4-3 35-10z"
                />
              </svg>
              <span className="ml-4">Log in with Google</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
