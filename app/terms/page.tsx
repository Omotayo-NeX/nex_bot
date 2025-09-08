import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Effective Date:</strong> September 8, 2025
        </p>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          By using NeX AI, you agree to these Terms of Service. Please read carefully.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Use of Service</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2">
          <li>NeX AI provides AI-powered tools for conversation, automation, and productivity.</li>
          <li>You agree not to misuse the platform (e.g., unlawful use, spamming, or harmful content).</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Accounts</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2">
          <li>You must provide accurate information during sign-up.</li>
          <li>You are responsible for maintaining the security of your account.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          NeX AI is provided "as is" without warranties. We are not responsible for losses arising from use of the service.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Termination</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Contact</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have questions, contact:
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          📧 <a href="mailto:nex@nexconsultingltd.com" className="text-blue-600 hover:underline">nex@nexconsultingltd.com</a>
        </p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}