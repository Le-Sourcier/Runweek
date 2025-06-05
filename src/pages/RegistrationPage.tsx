// src/components/LoginPage.jsx
import { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaGoogle,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function LoginPage() {
  const [lang, setLang] = useState("EN"); // Pour le sélecteur de langue
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100 p-4">
      {/* Cadre blanc englobant (border arrondie) */}
      <div className="relative flex w-full max-w-6xl h-full bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* ================== PARTIE GAUCHE ================== */}
        <div
          className="hidden lg:flex flex-1 relative bg-cover bg-center"
          style={{ backgroundImage: "url('/featured-works.jpg')" }}
        >
          {/* Overlay sombre pour intensifier le contraste si besoin */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Contenu en haut à gauche : “Selected Works” + Sign Up / Join Us */}
          <div className="absolute top-6 left-6 z-20 flex items-center justify-between w-[80%]">
            <h2 className="text-white text-2xl font-semibold">
              Selected Works
            </h2>
            <div className="space-x-4">
              <button className="text-white text-sm hover:underline">
                Sign Up
              </button>
              <button className="px-4 py-1 border border-white text-white rounded-full text-sm hover:bg-white hover:text-black transition">
                Join Us
              </button>
            </div>
          </div>

          {/* Contenu en bas à gauche : vignette de profil + flèches */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-4">
            {/* Vignette de profil */}
            <div className="flex items-center space-x-3">
              <img
                src="/avatar-sample.jpg"
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div className="flex flex-col text-white">
                <span className="font-medium">Andrew.ui</span>
                <span className="text-xs opacity-75">
                  UI &amp; Illustration
                </span>
              </div>
            </div>
            {/* Flèches de navigation */}
            <div className="flex space-x-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition">
                <FaArrowLeft className="text-white" size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition">
                <FaArrowRight className="text-white" size={14} />
              </button>
            </div>
          </div>

          {/* Bordure blanche arrondie verticale entre les parties */}
          <div className="absolute inset-y-0 right-0 w-1 bg-white"></div>
        </div>

        {/* ================== PARTIE DROITE ================== */}
        <div className="flex-1 flex flex-col justify-center items-center bg-white relative">
          {/* Sélecteur de langue en haut à droite */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition"
            >
              <img
                src={lang === "EN" ? "/flags/en.png" : "/flags/fr.png"}
                alt="Flag"
                className="w-4 h-4 rounded-sm"
              />
              <span>{lang}</span>
            </button>
          </div>

          {/* Formulaire central */}
          <div className="w-full max-w-md px-6 py-8 relative z-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Hi Designer
            </h1>
            <p className="text-gray-500 mb-6">Welcome to UISOCIAL</p>

            <form className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button className="text-sm text-red-500 hover:underline">
                    Forgot password ?
                  </button>
                </div>
              </div>

              {/* Séparateur “or” */}
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-3 text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Bouton “Login with Google” */}
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
              >
                <FaGoogle className="text-red-500 mr-2" size={18} />
                <span className="text-gray-700 font-medium">
                  Login with Google
                </span>
              </button>

              {/* Bouton “Login” rouge */}
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
              >
                Login
              </button>

              {/* Lien vers Sign Up */}
              <p className="text-center text-sm text-gray-500">
                Don’t have an account?{" "}
                <button className="text-red-500 hover:underline">
                  Sign up
                </button>
              </p>
            </form>

            {/* Icônes sociales en bas */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-gray-600 transition">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                <FaLinkedinIn size={18} />
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
