'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';

// Sample blog posts - in production, these would come from a CMS or database
const blogPosts = [
  {
    id: 1,
    title: 'How AI is Transforming Business Operations in Africa',
    excerpt: 'Discover how African businesses are leveraging AI technology to streamline operations, reduce costs, and improve customer experiences.',
    image: '/hero-nexlabs-2.png',
    author: 'NeX Labs Team',
    date: '2025-10-20',
    readTime: '5 min read',
    category: 'AI Innovation',
    slug: 'ai-transforming-business-africa'
  },
  {
    id: 2,
    title: 'Getting Started with NeX AI Chat: A Complete Guide',
    excerpt: 'Learn how to maximize your productivity with NeX AI Chat. From basic commands to advanced features, this guide covers everything you need to know.',
    image: '/hero-nexlabs-2.png',
    author: 'NeX Labs Team',
    date: '2025-10-15',
    readTime: '7 min read',
    category: 'Tutorial',
    slug: 'getting-started-nex-ai-chat'
  },
  {
    id: 3,
    title: 'Smart Expense Tracking for African Entrepreneurs',
    excerpt: 'Managing business expenses doesn\'t have to be complicated. See how NeX Expense uses AI to simplify financial tracking for small businesses.',
    image: '/hero-nexlabs-2.png',
    author: 'NeX Labs Team',
    date: '2025-10-10',
    readTime: '4 min read',
    category: 'Product Update',
    slug: 'smart-expense-tracking'
  },
  {
    id: 4,
    title: 'The Future of Voice AI in Content Creation',
    excerpt: 'Voice synthesis technology is revolutionizing content creation. Learn how NeX Voice can help you create professional audio content at scale.',
    image: '/hero-nexlabs-2.png',
    author: 'NeX Labs Team',
    date: '2025-10-05',
    readTime: '6 min read',
    category: 'AI Innovation',
    slug: 'future-of-voice-ai'
  }
];

const categories = ['All', 'AI Innovation', 'Tutorial', 'Product Update'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-nex-navy hover:text-nex-purple transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/Nex_logomark_white.png"
                alt="NeX Labs"
                width={32}
                height={32}
                className="invert"
              />
              <span className="text-xl font-bold text-nex-navy">NeX Labs Blog</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-purple py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Insights & Updates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Explore the latest in AI innovation, product updates, and tips for African entrepreneurs
          </motion.p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Category Filter - Optional for future implementation */}
        {/* <div className="flex gap-3 mb-12 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 rounded-full border-2 border-nex-purple text-nex-purple hover:bg-nex-purple hover:text-white transition-all duration-300 whitespace-nowrap"
            >
              {category}
            </button>
          ))}
        </div> */}

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-nex-purple/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-nex-purple text-white text-sm font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-nex-purple transition-colors">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-nex-purple font-semibold hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-nex-purple/10 to-nex-navy/10 rounded-2xl border-2 border-nex-purple/20">
            <span className="text-lg text-gray-700">
              More articles coming soon! Follow us on{' '}
              <a
                href="https://twitter.com/nexconsult_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nex-purple font-semibold hover:underline"
              >
                Twitter
              </a>
              {' '}for updates.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
