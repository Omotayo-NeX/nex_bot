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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('solutions')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Testimonials
            </button>
            
            <div className="flex items-center space-x-4">
              <Link href="/signup" className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition">
                Sign Up
              </Link>
              
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
          </div>
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-6xl mx-auto">
            {/* Laptop Mockup */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative flex-1 max-w-3xl"
            >
              <Image
                src="/features/laptop.png"
                alt="NeX AI on Desktop"
                width={1200}
                height={800}
                className="rounded-xl shadow-2xl object-cover w-full h-auto"
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
                width={400}
                height={800}
                className="rounded-xl shadow-2xl object-cover w-full h-auto max-w-xs"
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
      <section id="features" className="relative z-10 py-24 bg-white">
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
                  src="/images/voice.png"
                  alt="AI Voice Overs"
                  width={500}
                  height={400}
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
                  src="/images/pictures.png"
                  alt="AI Picture Generation"
                  width={500}
                  height={400}
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
                  src="/images/africa.png"
                  alt="Africa Startups"
                  width={500}
                  height={400}
                  className="object-cover rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your business in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Sign In</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your NeX AI account and access our powerful suite of AI tools
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Generate AI Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Create professional voice overs, stunning images, and automated workflows
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Grow Your Business</h3>
              <p className="text-gray-600 leading-relaxed">
                Scale your operations and reach new customers with AI-powered content
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="relative z-10 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our AI Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI tools designed for African entrepreneurs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Solution 1 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI Voice Overs</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Generate professional voice content in multiple African languages
              </p>
            </motion.div>

            {/* Solution 2 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI Picture Generation</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Create stunning visuals and marketing materials instantly
              </p>
            </motion.div>

            {/* Solution 3 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Workflow Automation</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Streamline your business processes with intelligent automation
              </p>
            </motion.div>

            {/* Solution 4 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI Chatbot</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Engage customers with intelligent conversational AI
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Entrepreneurs Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from African business leaders using NeX AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">AS</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Adebayo Sola</h4>
                  <p className="text-gray-600 text-sm">Startup Founder, Lagos</p>
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                "NeX AI transformed the way we create marketing content. Our reach increased by 300% in just two months!"
              </blockquote>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">KM</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Kemi Mustapha</h4>
                  <p className="text-gray-600 text-sm">Entrepreneur, Nairobi</p>
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                "Finally, AI tools built for African businesses. The voice generation in local languages is a game-changer!"
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to transform your business with AI?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of African entrepreneurs already using NeX AI to scale their businesses.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/api/auth/signin">
                <button className="relative px-12 py-6 text-xl font-semibold rounded-2xl overflow-hidden group transition-all duration-300 bg-white text-purple-700 hover:bg-gray-50 shadow-2xl hover:shadow-white/25">
                  <span className="relative flex items-center">
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
                </button>
              </Link>
            </motion.div>
          </motion.div>
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