import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/legal', label: 'Legal Hub' },
    { href: '/legal#privacy', label: 'Privacy Policy' },
    { href: '/legal#terms', label: 'Terms of Service' },
    { href: '/legal#billing', label: 'Billing & Refund Policy' },
    { href: '/legal#contact', label: 'Contact' },
    { href: '/pricing', label: 'Pricing' }
  ];

  return (
    <footer className="bg-gray-100 text-gray-600 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout: Stacked */}
        <div className="flex flex-col space-y-4 lg:hidden">
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm">
              © {currentYear} NeX Consulting Limited. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="text-sm hover:text-[#6C63FF] transition-colors duration-200"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="mx-2 text-gray-400">|</span>
                )}
              </span>
            ))}
          </div>

          {/* Brand */}
          <div className="text-center">
            <p className="text-sm">
              Powered by NeX Consulting Limited
            </p>
          </div>
        </div>

        {/* Desktop Layout: Horizontal */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          {/* Left: Copyright */}
          <div className="flex-shrink-0">
            <p className="text-sm">
              © {currentYear} NeX Consulting Limited. All rights reserved.
            </p>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="text-sm hover:text-[#6C63FF] transition-colors duration-200"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="mx-2 text-gray-400">|</span>
                )}
              </span>
            ))}
          </div>

          {/* Right: Brand */}
          <div className="flex-shrink-0">
            <p className="text-sm">
              Powered by NeX Consulting Limited
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}