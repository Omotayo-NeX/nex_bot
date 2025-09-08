"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Gradient Background Arcs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top Arc */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 via-purple-50 to-transparent blur-3xl"
        />
        
        {/* Bottom Arc */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-100 via-blue-50 to-transparent blur-3xl"
        />
        
        {/* Center Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-blue-50/30 via-purple-30/20 to-transparent blur-2xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-lg border-b border-gray-100' : ''
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image 
              src="/Nex_logomark_white.png" 
              alt="NeX Logo" 
              fill
              className="object-contain filter brightness-0"
            />
          </div>
          <span className="text-2xl font-bold text-gray-900">NeX AI</span>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/api/auth/signin">
            <button className="relative px-6 py-3 text-sm font-semibold rounded-xl overflow-hidden group border-2 border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300">
              <span className="absolute inset-0.5 bg-white rounded-lg group-hover:opacity-0 transition-opacity duration-300"></span>
              <span className="relative text-purple-700 group-hover:text-white transition-colors duration-300">
                Sign In →
              </span>
            </button>
          </Link>
        </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="block">Smarter Conversations,</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Powered by NeX AI
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Your all-in-one AI assistant for automation, voice, and intelligent workflows.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Link href="/api/auth/signin">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-12 py-6 text-xl font-semibold rounded-2xl overflow-hidden group transition-all duration-300 border-2 border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700"
            >
              {/* White background */}
              <span className="absolute inset-0.5 bg-white rounded-xl group-hover:opacity-0 transition-opacity duration-300"></span>
              {/* Content */}
              <span className="relative flex items-center text-purple-700 group-hover:text-white transition-colors duration-300">
                Sign In to Get Started
                <motion.svg
                  className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Device Mockups */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="mt-20 relative"
        >
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end lg:space-x-8 space-y-8 lg:space-y-0">
            {/* Laptop Mockup */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative"
            >
              <Image
                src="/features/laptop.png"
                alt="NeX AI on Laptop"
                width={600}
                height={375}
                className="object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent rounded-xl"></div>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative z-10"
            >
              <Image
                src="/features/phone.png"
                alt="NeX AI on Mobile"
                width={200}
                height={400}
                className="object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent rounded-xl"></div>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-sm"
          />
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute -bottom-8 right-1/4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-25 blur-sm"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white">
        {/* Feature 1 - AI Voice Overs (Text Left, Image Right) */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pr-8"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI Voice Overs
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Generate professional-quality voice overs in multiple languages, tailored for businesses and creators across Africa.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pl-8"
            >
              <div className="relative">
                <Image
                  src="/features/voice.png"
                  alt="AI Voice Overs"
                  width={1200}
                  height={800}
                  className="object-cover rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature 2 - AI Picture Generation (Image Left, Text Right) */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:order-1"
            >
              <div className="relative">
                <Image
                  src="/features/pictures.png"
                  alt="AI Picture Generation"
                  width={1200}
                  height={800}
                  className="object-cover rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pr-8 lg:order-2"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI Picture Generation
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Create high-quality visuals and marketing images instantly with NeX AI's picture generation tools.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Feature 3 - Built for African Businesses (Text Left, Image Right) */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pr-8"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for African Businesses
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                NeX AI is designed with the unique needs of African entrepreneurs in mind — accessible, scalable, and ready to power your business.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pl-8"
            >
              <div className="relative">
                <Image
                  src="/features/africa.png"
                  alt="Built for African Businesses"
                  width={1200}
                  height={800}
                  className="object-cover rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="relative w-8 h-8">
                <Image 
                  src="/Nex_logomark_white.png" 
                  alt="NeX Logo" 
                  fill
                  className="object-contain filter brightness-0"
                />
              </div>
              <span className="text-lg font-semibold text-gray-900">NeX AI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 mb-2">
                Powered by{" "}
                <a href="https://nexconsultingltd.com" className="text-blue-600 hover:text-blue-800 font-medium">
                  Nex Consulting Limited
                </a>
              </p>
              <p className="text-sm text-gray-500">© 2024 NeX AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}