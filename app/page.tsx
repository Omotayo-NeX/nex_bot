"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto"
      >
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
          <Link
            href="/api/auth/signin"
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            Sign In
          </Link>
        </motion.div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
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
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center px-12 py-6 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
            >
              <span>Sign In to Get Started</span>
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
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Scrolling Features Section */}
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
                AI Voice Overs at Your Fingertips
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Generate professional-quality voice overs in multiple languages, tailored for businesses and creators across Africa. Transform your content with natural-sounding AI voices that engage your audience.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/voiceover"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Try Voice Overs
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pl-8"
            >
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                  <Image
                    src="/features/voice.png"
                    alt="AI Voice Overs"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-60"></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Feature 2 - AI Picture Generation (Image Left, Text Right) */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pr-8 lg:order-2"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Turn Ideas into Pictures
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Create high-quality visuals and marketing images instantly with NeX AI's picture generation tools. Perfect for social media, marketing campaigns, and creative projects.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/picture-generator"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  Generate Images
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:order-1"
            >
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                  <Image
                    src="/features/pictures.png"
                    alt="AI Picture Generation"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-60"></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
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
                Made for Africa, Built for Growth
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                NeX AI is designed with the unique needs of African entrepreneurs in mind — accessible, scalable, and ready to power your business. From Lagos to Nairobi, from Cape Town to Cairo.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                >
                  Start Building
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="lg:pl-8"
            >
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                  <Image
                    src="/features/africa.png"
                    alt="Built for African Businesses"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-60"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose NeX AI?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI-powered conversations and automation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conversational AI</h3>
            <p className="text-gray-600 leading-relaxed">
              Engage in natural, intelligent conversations with our advanced AI that understands context and provides meaningful responses.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Voice & Automation</h3>
            <p className="text-gray-600 leading-relaxed">
              Transform your workflow with voice commands and intelligent automation that adapts to your needs and preferences.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Scalable</h3>
            <p className="text-gray-600 leading-relaxed">
              Built with enterprise-grade security and scalability to grow with your business needs while protecting your data.
            </p>
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