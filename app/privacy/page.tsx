import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Effective Date:</strong> September 8, 2025
        </p>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          At NeX AI, we respect your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Information We Collect</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2">
          <li>Basic account details from Google (name, email, profile picture).</li>
          <li>Information you voluntarily provide while using NeX AI (conversations, prompts, or preferences).</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">How We Use Information</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-2">
          <li>To provide AI-powered services such as chat, automation, and personalization.</li>
          <li>To improve our platform's functionality and security.</li>
          <li>To communicate with you about updates and features.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 mt-8">Data Protection</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          We use industry-standard measures to secure your data. We do not sell or rent your personal information to third parties.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Third-Party Services</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          We use Google OAuth for authentication. Google's Privacy Policy applies to data shared via Google sign-in.
        </p>

        <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          You may request to access or delete your account data by contacting us at:
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