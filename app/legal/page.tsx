'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import Link from 'next/link';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const legalSections: AccordionItem[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: `Privacy Policy for NeX AI
Effective Date: 1st October 2025

NeX AI ("we," "our," "us"), powered by NeX Consulting Limited, respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Services").

Information We Collect

• Personal Information: Name, email, phone number, account credentials, payment details (if applicable).
• Usage Data: App activity, device information, IP address, cookies, and analytics.
• Third-Party Integrations: If you connect with Google, Apple, or other platforms, we may access information authorized by you.

How We Use Your Information

• To provide and improve our Services
• To personalize your experience
• To process payments and subscriptions
• To send updates, notifications, and marketing (with your consent)
• To comply with legal and regulatory requirements

Sharing of Information
We do not sell your data. We may share it with:

• Service providers (cloud hosting, analytics, payment processors)
• Legal authorities (where required by law)
• Business transfers (if NeX AI is acquired or merged)

Data Retention
We retain your data as long as necessary to provide our Services or comply with legal obligations.

Security
We use industry-standard encryption and security measures to protect your information.

Your Rights
You may request access, correction, deletion, or restriction of your data at any time by contacting us at support@nexconsultingltd.com.

Changes to This Policy
We may update this Privacy Policy periodically. Updates will be posted here with a revised effective date.`
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: `Terms of Service for NeX AI
Effective Date: 1st October 2025

Welcome to NeX AI, powered by NeX Consulting Limited. By using our app, website, or services, you agree to the following terms:

Use of Services

• You must be at least 13 years old to use NeX AI.
• You agree not to misuse the Services, attempt unauthorized access, or engage in illegal activities.

Accounts

• You are responsible for maintaining the confidentiality of your login credentials.
• You agree to provide accurate and up-to-date information when creating an account.

Payments & Subscriptions

• Some features may require paid subscriptions. By purchasing, you agree to our Billing Terms below.
• Subscriptions may auto-renew unless cancelled in accordance with app store policies.

Intellectual Property

• All content, software, and branding are owned by NeX Consulting Limited.
• You may not copy, modify, or redistribute our intellectual property without written consent.

Limitation of Liability

• NeX AI is provided "as is" without warranties of any kind.
• We are not liable for damages arising from the use or inability to use the Services.

Termination
We reserve the right to suspend or terminate accounts that violate these Terms.

Governing Law
These Terms are governed by the laws of Nigeria.`
  },
  {
    id: 'billing',
    title: 'Billing & Refund Policy',
    content: `Billing & Refund Policy for NeX AI
Effective Date: 1st October 2025

Payments
All payments for subscriptions or premium features are processed securely via Google Play, Apple App Store, or approved third-party payment providers.

Auto-Renewals
Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date.

Refunds
Refunds are handled according to the policies of Google Play or the Apple App Store. Please submit refund requests directly through your app store account.

Failed Payments
We may suspend access to paid features if payment fails.`
  },
  {
    id: 'contact',
    title: 'Contact / Support',
    content: `If you have questions, complaints, or requests, please contact us:

📧 nex@nexconsultingltd.com
🌐 https://nexconsultingltd.com
📍 Abuja, Nigeria`
  }
];

export default function LegalHub() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] to-[#eef2ff] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-4xl font-bold text-[#6C63FF] mb-2">Legal Hub – NeX AI</h1>
          <p className="text-gray-600 mb-4">Powered by NeX Consulting Limited</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-[#6C63FF] text-white font-medium rounded-lg shadow-md hover:bg-[#574fd6] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {legalSections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200/50"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50/80 transition-colors duration-200"
              >
                <h2 className="font-semibold text-lg text-[#6C63FF] hover:text-[#4b47cc] transition-colors">
                  {section.title}
                </h2>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="h-5 w-5 text-[#6C63FF]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#6C63FF]" />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.has(section.id)
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md leading-relaxed">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                        {section.content}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-[#6C63FF] text-white rounded-full shadow-lg hover:bg-[#574fd6] transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

    </div>
  );
}