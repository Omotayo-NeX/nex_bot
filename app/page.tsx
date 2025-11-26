"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Wallet,
  Mic,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Users,
  BarChart3
} from "lucide-react";
import AuthModal from "./components/AuthModal";

export default function NexLabsHomepage() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-nex-purple/20 via-nex-purple/10 to-transparent blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-nex-navy-light/20 via-nex-navy/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-nex-purple/10 via-transparent to-transparent blur-2xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'shadow-lg border-b border-gray-100' : ''
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/Nex_logomark_white.png"
                alt="NeX Labs Logo"
                fill
                sizes="40px"
                className="object-contain filter brightness-0"
              />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 group-hover:text-nex-navy transition-colors">
              NeX Labs
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('products')}
              className="text-gray-600 hover:text-nex-navy font-medium transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-nex-navy font-medium transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('vision')}
              className="text-gray-600 hover:text-nex-navy font-medium transition-colors"
            >
              Vision
            </button>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-nex-navy font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/legal"
              className="text-gray-600 hover:text-nex-navy font-medium transition-colors"
            >
              Legal
            </Link>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setShowAuthModal(true)}
                className="relative px-6 py-3 text-sm font-semibold rounded-xl bg-nex-purple text-white hover:bg-nex-purple-dark transition-all duration-300 shadow-lg hover:shadow-nex-purple/30"
              >
                Sign In
              </button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-24 text-center">
        {/* Background Image - Full Width */}
        <div className="absolute inset-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
          <Image
            src="/hero-nexlabs-2.png"
            alt="NeX Labs - AI Innovation Hub for African Businesses"
            fill
            priority
            quality={90}
            className="object-cover object-center"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD"
          />
          {/* Multi-layer Gradient Overlay for Better Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/85"></div>
          {/* Radial gradient for text focus area */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_white_70%)] opacity-40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto">

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block mb-6 px-4 py-2 bg-nex-purple/20 rounded-full border border-nex-purple/40 backdrop-blur-md shadow-lg"
          >
            <span className="text-sm font-semibold text-nex-navy">
              Welcome to NeX AI Labs
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-8 leading-tight">
            <span className="block text-gray-900 drop-shadow-sm">AI Products Powering</span>
            <span className="block bg-gradient-to-r from-nex-navy via-nex-purple to-nex-purple-light bg-clip-text text-transparent drop-shadow-sm">
              Africa's Future
            </span>
          </h1>
        </motion.div>

        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 font-medium mb-12 max-w-4xl mx-auto leading-relaxed relative z-10 drop-shadow-sm px-4"
        >
          From <Link href="/chat" className="text-nex-navy hover:text-nex-purple underline decoration-nex-purple/30 transition-colors">AI Chat assistants</Link> to <Link href="/expensa" className="text-nex-navy hover:text-nex-purple underline decoration-nex-purple/30 transition-colors">intelligent expense tracking</Link>, NeX Labs builds automation tools that help African businesses work smarter.
        </motion.h2>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
        >
          <motion.button
            onClick={() => scrollToSection('products')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl bg-nex-purple text-white hover:bg-nex-purple-dark transition-all duration-300 shadow-2xl hover:shadow-nex-purple/50"
          >
            <span className="flex items-center justify-center">
              Explore Our Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </span>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/chat"
              className="relative block w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl bg-nex-navy text-white hover:bg-nex-navy-light transition-all duration-300 shadow-xl text-center"
            >
              Try NeX AI Chat
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Animation Elements */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="mt-20 relative"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-4">
            {[
              { icon: MessageSquare, label: "AI Chat" },
              { icon: Wallet, label: "Expense" },
              { icon: Mic, label: "Voice" },
              { icon: Sparkles, label: "Studio" }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
              >
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-nex-purple mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Where Intelligence Meets Innovation
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                NeX Labs is where intelligence meets innovation. We design and build <strong>AI products for African businesses</strong> that automate workflows, improve communication, and drive efficiency.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Every product we launch — from <Link href="/chat" className="text-nex-navy hover:text-nex-purple font-semibold underline decoration-nex-purple/30">NeX AI Chat</Link> to <Link href="/expensa" className="text-nex-navy hover:text-nex-purple font-semibold underline decoration-nex-purple/30">NeX Expense</Link> — is built to bring the future of automation closer to you.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                >
                  <Zap className="w-12 h-12 text-nex-purple mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Fast</h3>
                  <p className="text-sm text-gray-600">Lightning-quick responses</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mt-8"
                >
                  <Globe className="w-12 h-12 text-nex-navy mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Global</h3>
                  <p className="text-sm text-gray-600">Built for Africa</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                >
                  <Users className="w-12 h-12 text-nex-purple mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Collaborative</h3>
                  <p className="text-sm text-gray-600">Team-first design</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mt-8"
                >
                  <BarChart3 className="w-12 h-12 text-nex-navy mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Scalable</h3>
                  <p className="text-sm text-gray-600">Grows with you</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="relative z-10 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our AI Products
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Intelligent solutions powering the future of business automation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* NeX AI Chat */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-nex-navy to-nex-navy-light overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nex-purple/20 to-transparent"></div>
                <MessageSquare className="absolute top-8 left-8 w-16 h-16 text-nex-purple" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-10 -right-10 w-40 h-40 border-4 border-nex-purple/30 rounded-full"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">NeX AI Chat</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Your AI assistant for automation, voice, and intelligent workflows. Create content, automate tasks, and communicate smarter.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center text-nex-navy font-semibold hover:text-nex-purple transition-colors"
                >
                  Launch Chat
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* NeX Expense */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-600 to-emerald-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nex-yellow/20 to-transparent"></div>
                <Wallet className="absolute top-8 left-8 w-16 h-16 text-white" />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-10 -right-10 w-40 h-40 border-4 border-white/30 rounded-full"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">NeX Expense</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Smart expense tracking powered by AI — capture receipts, automate reports, and approve in seconds.
                </p>
                <Link
                  href="/expensa"
                  className="inline-flex items-center text-green-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Explore Expense
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* NeX Voice */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-block px-3 py-1 bg-nex-purple text-white text-xs font-bold rounded-full">
                  COMING SOON
                </span>
              </div>
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-indigo-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nex-purple/20 to-transparent"></div>
                <Mic className="absolute top-8 left-8 w-16 h-16 text-white" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-8 right-8 w-20 h-20 bg-white/20 rounded-full"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">NeX Voice</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Human-like voice automation for brands and businesses. Create professional voice overs in African languages.
                </p>
                <button className="inline-flex items-center text-purple-600 font-semibold hover:text-indigo-700 transition-colors">
                  Join Waitlist
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* NeX Studio */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-block px-3 py-1 bg-nex-purple text-white text-xs font-bold rounded-full">
                  COMING SOON
                </span>
              </div>
              <div className="relative h-48 bg-gradient-to-br from-orange-500 to-rose-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nex-purple/20 to-transparent"></div>
                <Sparkles className="absolute top-8 left-8 w-16 h-16 text-white" />
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-8 right-8 w-16 h-16 bg-white/20 rounded-lg rotate-12"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">NeX Studio</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  AI design and content generation tools for creators. Build stunning visuals, videos, and marketing content.
                </p>
                <button className="inline-flex items-center text-orange-600 font-semibold hover:text-rose-600 transition-colors">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="relative z-10 py-24 bg-gradient-to-br from-nex-purple/10 via-white to-nex-navy/5 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 border-4 border-nex-purple/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-60 h-60 border-4 border-nex-navy/10 rounded-full"
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Building Africa's <br />
              <span className="bg-gradient-to-r from-nex-navy via-nex-purple to-nex-navy bg-clip-text text-transparent">
                Intelligent Future
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Our mission is to make creativity, productivity, and communication smarter for every business.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                { number: "50K+", label: "Active Users" },
                { number: "1M+", label: "AI Interactions" },
                { number: "10+", label: "Countries" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg"
                >
                  <h3 className="text-3xl sm:text-4xl font-bold text-nex-navy mb-2">{stat.number}</h3>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="bg-gradient-to-r from-nex-navy to-nex-navy-light rounded-2xl p-12 text-white overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ x: [-100, 100], y: [-100, 100] }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute top-0 right-0 w-64 h-64 bg-nex-purple/20 rounded-full blur-3xl"
                />
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                  Part of the NeX Consulting Ecosystem
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                  NeX Labs is part of NeX Consulting — Africa's creative and digital powerhouse. Together, we bridge AI innovation with real business growth.
                </p>
                <a
                  href="https://nexconsultingltd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-nex-purple text-white font-semibold rounded-xl hover:bg-nex-purple-dark transition-all duration-300 shadow-lg hover:shadow-nex-purple/30"
                >
                  Learn More About NeX Consulting
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="relative z-10 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-nex-purple/10 text-nex-purple font-semibold rounded-full text-sm mb-4">
              Latest Insights
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              From the NeX Labs Blog
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Stay updated with AI trends, product updates, and tips for African entrepreneurs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {/* Featured Blog Post 1 */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-nex-purple/30 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-nex-navy to-nex-purple">
                <Image
                  src="/hero-nexlabs-2.png"
                  alt="AI in Africa"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30">
                    AI Innovation
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mb-3">
                  <span>Oct 20, 2025</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-nex-purple transition-colors">
                  How AI is Transforming Business Operations in Africa
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Discover how African businesses are leveraging AI technology to streamline operations, reduce costs, and improve customer experiences.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-nex-purple font-semibold hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>

            {/* Featured Blog Post 2 */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-nex-purple/30 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-nex-purple to-nex-navy-light">
                <Image
                  src="/hero-nexlabs-2.png"
                  alt="NeX AI Tutorial"
                  fill
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30">
                    Tutorial
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mb-3">
                  <span>Oct 15, 2025</span>
                  <span>•</span>
                  <span>7 min read</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-nex-purple transition-colors">
                  Getting Started with NeX AI Chat: A Complete Guide
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Learn how to maximize your productivity with NeX AI Chat. From basic commands to advanced features, this guide covers everything you need.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-nex-purple font-semibold hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-nex-navy text-white font-semibold rounded-xl hover:bg-nex-navy-light transition-all duration-300 shadow-lg hover:shadow-nex-navy/30"
            >
              View All Articles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-nex-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/Nex_logomark_white.png"
                    alt="NeX Labs"
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold">NeX Labs</span>
              </div>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-md">
                Building Africa's intelligent future with innovative AI products that empower businesses to work smarter.
              </p>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/chat" className="text-white/70 hover:text-nex-purple transition-colors">
                    NeX AI Chat
                  </Link>
                </li>
                <li>
                  <Link href="/expensa" className="text-white/70 hover:text-nex-purple transition-colors">
                    NeX Expense
                  </Link>
                </li>
                <li>
                  <span className="text-white/50">NeX Voice (Soon)</span>
                </li>
                <li>
                  <span className="text-white/50">NeX Studio (Soon)</span>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-white/70 hover:text-nex-purple transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <Link href="/legal" className="text-white/70 hover:text-nex-purple transition-colors">
                    Legal
                  </Link>
                </li>
                <li>
                  <a
                    href="https://nexconsultingltd.com/careers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-nex-purple transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/50 text-sm mb-4 md:mb-0">
              © 2025 NeX Consulting Ltd. All rights reserved.
            </p>

            <div className="flex items-center space-x-6">
              <a
                href="https://linkedin.com/company/nexconsulting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-nex-purple transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/nexconsult_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-nex-purple transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
