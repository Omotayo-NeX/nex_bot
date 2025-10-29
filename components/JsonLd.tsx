import Script from 'next/script';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NeX Labs',
    legalName: 'NeX Consulting Limited',
    alternateName: 'NeX AI',
    url: 'https://ai.nexconsultingltd.com',
    logo: 'https://ai.nexconsultingltd.com/Nex_logomark_white.png',
    description: 'NeX Labs is the AI innovation hub under NeX Consulting Ltd. Building intelligent products like NeX AI Chat and NeX Expense that help African businesses automate workflows and work smarter.',
    foundingDate: '2023',
    areaServed: {
      '@type': 'Place',
      name: 'Africa',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'nexconsultingltd@gmail.com',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/nexconsult_AI',
      'https://linkedin.com/company/nexconsulting',
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NeX Labs',
    alternateName: 'NeX AI',
    url: 'https://ai.nexconsultingltd.com',
    description: 'AI-powered business automation tools for African entrepreneurs. NeX AI Chat, NeX Expense tracking, and intelligent workflows.',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'NeX Labs',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ai.nexconsultingltd.com/chat?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NeX Labs',
    alternateName: 'NeX AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free tier available with premium plans',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
    description: 'AI-powered business automation platform featuring NeX AI Chat assistant, NeX Expense tracking, image generation, voice synthesis, and intelligent workflow tools designed specifically for African entrepreneurs.',
    featureList: [
      'AI Chat Assistant for business automation',
      'AI-powered Expense Tracking and Management',
      'AI Image Generation for marketing content',
      'AI Voice Synthesis for audio content',
      'Intelligent workflow automation',
      'Usage analytics and insights',
      'Multi-tier subscription plans',
    ],
    screenshot: 'https://ai.nexconsultingltd.com/hero-nexlabs-2.png',
    author: {
      '@type': 'Organization',
      name: 'NeX Consulting Limited',
    },
  };

  return (
    <Script
      id="software-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
