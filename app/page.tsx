import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to NeX Bot
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI assistant for NeX Consulting
        </p>
        <Link 
          href="/chat"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Start Chatting
        </Link>
      </div>
    </div>
  )
}
