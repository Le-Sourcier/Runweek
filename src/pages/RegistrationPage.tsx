// src/components/RegisterPage.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

export default function RegisterPage() {
  const [lang, setLang] = useState("EN");
  const [showPassword, setShowPassword] = useState(false);

  // ⇨ DIRECTION  : 1 = Next, -1 = Prev
  const [direction, setDirection] = useState(0);
  // ⇨ INDEX SLIDE COURANT
  const [selected, setSelected] = useState(0);

  // ⇨ DONNÉES DU SLIDER (identique à LoginPage)
  const slides = [
    {
      src: "/1_keep_runing.png",
      title: "Keep Running",
      subtitle: "Never stop pushing your limits",
    },
    {
      src: "/2_blue_runner.png",
      title: "Blue Runner",
      subtitle: "Feel the breeze, break your record",
    },
    {
      src: "/3_cap_runner.png",
      title: "Cap Runner",
      subtitle: "Style meets performance",
    },
    {
      src: "/4_transparent_cap_runner.jpg",
      title: "Transparent Cap Runner",
      subtitle: "Innovation you can see through",
    },
  ];

  const handleNext = () => {
    setDirection(1);
    setSelected((prev) => (prev + 1 >= slides.length ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setSelected((prev) => (prev - 1 < 0 ? slides.length - 1 : prev - 1));
  };

  // ⇨ Variants Framer Motion pour l’image de fond
  const imageVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: "easeIn",
      },
    }),
  };

  // ⇨ Variants Framer Motion pour le contenu texte (titre + subtitle)
  const textVariants = {
    enter: {
      y: 20,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  // ⇨ Variants pour animer les champs du formulaire en séquence
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };
  const fieldVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // ⇨ État du formulaire d'inscription
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    consent: false,
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register form submitted:", formValues);
    // À remplacer par l'appel API / validation réelle
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100 p-4">
      {/* Cadre blanc arrondi */}
      <div className="relative flex w-full max-w-6xl h-full bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* ====================== PARTIE GAUCHE (Slider animé) ====================== */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {/* motion.div animé pour l’image de fond */}
            <motion.div
              key={selected}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${slides[selected].src}')`,
              }}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Overlay semi‐transparent pour lire le texte */}
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>

              {/* Conteneur du texte (titre + sous‐titre) */}
              <div className="absolute inset-0 flex flex-col items-start justify-center pl-12 z-10">
                <AnimatePresence initial={false} custom={direction}>
                  {/* Titre */}
                  <motion.h2
                    key={`title-${selected}`}
                    custom={direction}
                    className="text-5xl font-bold text-white mb-2"
                    variants={textVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {slides[selected].title}
                  </motion.h2>
                </AnimatePresence>

                <AnimatePresence initial={false} custom={direction}>
                  {/* Sous‐titre */}
                  <motion.p
                    key={`subtitle-${selected}`}
                    custom={direction}
                    className="text-lg text-gray-200 max-w-md"
                    variants={textVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {slides[selected].subtitle}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Overlay semi‐transparent au-dessus de l’image */}
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

          {/* Bandeau Top Left : “Selected Works” + boutons */}
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

          {/* Contenu bottom left : vignette profil + flèches */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center justify-between w-full pr-6">
            {/* Vignette de profil (léger bounce) */}
            <div className="flex items-center space-x-3 hover:animate-none animate-bounce transform transition-all duration-300 cursor-pointer z-20">
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
            <div className="flex space-x-2 -translate-x-12 z-20">
              <button
                onClick={handlePrev}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition"
              >
                <FaArrowLeft className="text-white" size={14} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition"
              >
                <FaArrowRight className="text-white" size={14} />
              </button>
            </div>
          </div>

          {/* Séparation blanche verticale */}
          <div className="absolute inset-y-0 right-0 w-1 bg-white z-20"></div>
        </div>

        {/* ====================== PARTIE DROITE (Formulaire d’inscription) ====================== */}
        <div className="flex-1 flex flex-col justify-center items-center bg-white relative">
          {/* Sélecteur de langue (top-right) */}
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

          {/* Formulaire d’inscription animé */}
          <div className="w-full max-w-md px-6 py-8 relative z-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              👋 Welcome,
            </h1>
            <p className="text-gray-500 mb-6">Create your account</p>

            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              {/* ----- Champ Name ----- */}
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </motion.div>

              {/* ----- Champ Email ----- */}
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </motion.div>

              {/* ----- Champ Phone ----- */}
              <motion.div variants={fieldVariants}>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formValues.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </motion.div>

              {/* ----- Champ Password ----- */}
              <motion.div variants={fieldVariants} className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </motion.div>

              {/* ----- Case à cocher Consentement ----- */}
              <motion.div
                variants={fieldVariants}
                className="flex items-center space-x-2"
              >
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formValues.consent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms &amp; Conditions
                  </a>
                </label>
              </motion.div>

              {/* ----- Bouton Register ----- */}
              <motion.div variants={fieldVariants}>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Register
                </button>
              </motion.div>
            </motion.form>

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

// // src/components/LoginPage.jsx
// import { useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   FaArrowLeft,
//   FaArrowRight,
//   FaGoogle,
//   FaFacebookF,
//   FaTwitter,
//   FaLinkedinIn,
//   FaInstagram,
// } from "react-icons/fa";

// export default function LoginPage() {
//   const [lang, setLang] = useState("EN");
//   const [showPassword, setShowPassword] = useState(false);

//   // ⇨ DIRECTION  : 1 = Next, -1 = Prev
//   const [direction, setDirection] = useState(0);
//   // ⇨ INDEX SLIDE COURANT
//   const [selected, setSelected] = useState(0);

//   // ⇨ DONNÉES DU SLIDER
//   const slides = [
//     {
//       src: "/1_keep_runing.png",
//       title: "Keep Running",
//       subtitle: "Never stop pushing your limits",
//     },
//     {
//       src: "/2_blue_runner.png",
//       title: "Blue Runner",
//       subtitle: "Feel the breeze, break your record",
//     },
//     {
//       src: "/3_cap_runner.png",
//       title: "Cap Runner",
//       subtitle: "Style meets performance",
//     },
//     {
//       src: "/4_transparent_cap_runner.jpg",
//       title: "Transparent Cap Runner",
//       subtitle: "Innovation you can see through",
//     },
//   ];

//   const handleNext = () => {
//     setDirection(1);
//     setSelected((prev) => (prev + 1 >= slides.length ? 0 : prev + 1));
//   };

//   const handlePrev = () => {
//     setDirection(-1);
//     setSelected((prev) => (prev - 1 < 0 ? slides.length - 1 : prev - 1));
//   };

//   // ⇨ Variants Framer Motion pour l’image de fond
//   const imageVariants = {
//     enter: (dir: number) => ({
//       x: dir > 0 ? 200 : -200,
//       opacity: 0,
//       scale: 1.1,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//       scale: 1,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut",
//       },
//     },
//     exit: (dir: number) => ({
//       x: dir > 0 ? -200 : 200,
//       opacity: 0,
//       scale: 1.1,
//       transition: {
//         duration: 0.6,
//         ease: "easeIn",
//       },
//     }),
//   };

//   // ⇨ Variants Framer Motion pour le contenu texte (titre + subtitle)
//   const textVariants = {
//     enter: {
//       y: 20,
//       opacity: 0,
//     },
//     center: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         delay: 0.4,
//         duration: 0.6,
//         ease: "easeOut",
//       },
//     },
//     exit: {
//       y: -20,
//       opacity: 0,
//       transition: {
//         duration: 0.3,
//         ease: "easeIn",
//       },
//     },
//   };

//   return (
//     <div className="flex items-center justify-center w-full h-screen bg-gray-100 p-4">
//       {/* Cadre blanc arrondi */}
//       <div className="relative flex w-full max-w-6xl h-full bg-white rounded-3xl overflow-hidden shadow-xl">
//         {/* ====================== PARTIE GAUCHE (Slider animé) ====================== */}
//         <div className="hidden lg:flex flex-1 relative overflow-hidden">
//           <AnimatePresence initial={false} custom={direction} mode="wait">
//             {/* motion.div animé pour l’image de fond */}
//             <motion.div
//               key={selected}
//               className="absolute inset-0 bg-cover bg-center"
//               style={{
//                 backgroundImage: `url('${slides[selected].src}')`,
//               }}
//               custom={direction}
//               variants={imageVariants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//             >
//               {/* On ajoute un overlay semi‐transparent pour bien lire le texte */}
//               <div className="absolute inset-0 bg-black bg-opacity-50"></div>

//               {/* Conteneur du texte (titre + sous‐titre) */}
//               <div className="absolute inset-0 flex flex-col items-start justify-center pl-12 z-10">
//                 <AnimatePresence initial={false} custom={direction}>
//                   {/* Titre */}
//                   <motion.h2
//                     key={`title-${selected}`}
//                     custom={direction}
//                     className="text-5xl font-bold text-white mb-2"
//                     variants={textVariants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                   >
//                     {slides[selected].title}
//                   </motion.h2>
//                 </AnimatePresence>

//                 <AnimatePresence initial={false} custom={direction}>
//                   {/* Sous‐titre */}
//                   <motion.p
//                     key={`subtitle-${selected}`}
//                     custom={direction}
//                     className="text-lg text-gray-200 max-w-md"
//                     variants={textVariants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                   >
//                     {slides[selected].subtitle}
//                   </motion.p>
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           </AnimatePresence>

//           {/* Overlay semi‐transparent au-dessus de l’image */}
//           <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

//           {/* Bandeau Top Left : “Selected Works” + boutons */}
//           <div className="absolute top-6 left-6 z-20 flex items-center justify-between w-[80%]">
//             <h2 className="text-white text-2xl font-semibold">
//               Selected Works
//             </h2>
//             <div className="space-x-4">
//               <button className="text-white text-sm hover:underline">
//                 Sign Up
//               </button>
//               <button className="px-4 py-1 border border-white text-white rounded-full text-sm hover:bg-white hover:text-black transition">
//                 Join Us
//               </button>
//             </div>
//           </div>

//           {/* Contenu bottom left : vignette profil + flèches */}
//           <div className="absolute bottom-6 left-6 z-20 flex items-center justify-between w-full pr-6">
//             {/* Vignette de profil (léger bounce) */}
//             <div className="flex items-center space-x-3 hover:animate-none animate-bounce transform transition-all duration-300 cursor-pointer z-20">
//               <img
//                 src="/avatar-sample.jpg"
//                 alt="Profile"
//                 className="w-12 h-12 rounded-full object-cover border-2 border-white"
//               />
//               <div className="flex flex-col text-white">
//                 <span className="font-medium">Andrew.ui</span>
//                 <span className="text-xs opacity-75">
//                   UI &amp; Illustration
//                 </span>
//               </div>
//             </div>
//             {/* Flèches de navigation */}
//             <div className="flex space-x-2 -translate-x-12 z-20">
//               <button
//                 onClick={handlePrev}
//                 className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition"
//               >
//                 <FaArrowLeft className="text-white" size={14} />
//               </button>
//               <button
//                 onClick={handleNext}
//                 className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition"
//               >
//                 <FaArrowRight className="text-white" size={14} />
//               </button>
//             </div>
//           </div>

//           {/* Séparation blanche verticale */}
//           <div className="absolute inset-y-0 right-0 w-1 bg-white z-20"></div>
//         </div>

//         {/* ====================== PARTIE DROITE (Formulaire) ====================== */}
//         <div className="flex-1 flex flex-col justify-center items-center bg-white relative">
//           {/* Sélecteur de langue (top-right) */}
//           <div className="absolute top-6 right-6 z-10">
//             <button
//               onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
//               className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition"
//             >
//               <img
//                 src={lang === "EN" ? "/flags/en.png" : "/flags/fr.png"}
//                 alt="Flag"
//                 className="w-4 h-4 rounded-sm"
//               />
//               <span>{lang}</span>
//             </button>
//           </div>

//           {/* Formulaire de connexion */}
//           <div className="w-full max-w-md px-6 py-8 relative z-10">
//             <h1 className="text-3xl font-bold text-gray-800 mb-1">👋 Hi,</h1>
//             <p className="text-gray-500 mb-6">Welcome to RUNWEEK</p>

//             <form className="space-y-4">
//               {/* Email */}
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Email
//                 </label>
//                 <input
//                   id="email"
//                   type="email"
//                   placeholder="email@example.com"
//                   className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                 />
//               </div>

//               {/* Mot de passe */}
//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 <div className="text-right mt-1">
//                   <button className="text-sm text-red-500 hover:underline">
//                     Forgot password ?
//                   </button>
//                 </div>
//               </div>

//               {/* Séparateur “or” */}
//               <div className="flex items-center my-2">
//                 <div className="flex-1 h-px bg-gray-200"></div>
//                 <span className="px-3 text-gray-400 text-sm">or</span>
//                 <div className="flex-1 h-px bg-gray-200"></div>
//               </div>

//               {/* Bouton “Login with Google” */}
//               <button
//                 type="button"
//                 className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
//               >
//                 <FaGoogle className="text-red-500 mr-2" size={18} />
//                 <span className="text-gray-700 font-medium">
//                   Login with Google
//                 </span>
//               </button>

//               {/* Bouton “Login” rouge */}
//               <button
//                 type="submit"
//                 className="w-full mt-2 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
//               >
//                 Login
//               </button>

//               {/* Lien vers Sign Up */}
//               <p className="text-center text-sm text-gray-500">
//                 Don’t have an account?{" "}
//                 <button className="text-red-500 hover:underline">
//                   Sign up
//                 </button>
//               </p>
//             </form>

//             {/* Icônes sociales en bas */}
//             <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
//               <a href="#" className="hover:text-gray-600 transition">
//                 <FaFacebookF size={18} />
//               </a>
//               <a href="#" className="hover:text-gray-600 transition">
//                 <FaTwitter size={18} />
//               </a>
//               <a href="#" className="hover:text-gray-600 transition">
//                 <FaLinkedinIn size={18} />
//               </a>
//               <a href="#" className="hover:text-gray-600 transition">
//                 <FaInstagram size={18} />
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
