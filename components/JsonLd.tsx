import Script from 'next/script';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NeX Consulting Limited',
    legalName: 'NeX Consulting Limited',
    url: 'https://ai.nexconsultingltd.com',
    logo: 'https://ai.nexconsultingltd.com/Nex_logomark_white.png',
    description: 'AI-powered marketing automation and business intelligence platform for African entrepreneurs',
    foundingDate: '2023',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'nexconsultingltd@gmail.com',
    },
    sameAs: [
      // Add social media links when available
      'https://twitter.com/nexconsult_AI',
      'https://linkedin.com/company/nex-consulting-ltd',
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
    name: 'NeX AI',
    url: 'https://ai.nexconsultingltd.com',
    description: 'AI-powered marketing automation for African entrepreneurs',
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
    name: 'NeX AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
    description: 'AI-powered marketing automation platform featuring intelligent chat assistant, image generation, voice synthesis, and business intelligence tools designed specifically for African entrepreneurs.',
    featureList: [
      'AI Chat Assistant for marketing and business advice',
      'AI Image Generation for marketing content',
      'AI Voice Synthesis for voiceovers and audio content',
      'RAG Knowledge Base for business insights',
      'Usage analytics and cost tracking',
      'Multi-tier subscription plans',
    ],
    screenshot: 'https://ai.nexconsultingltd.com/og-image',
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
