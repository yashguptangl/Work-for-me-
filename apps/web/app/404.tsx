import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-2">Page Not Found</h2>
      <p className="mb-6 text-gray-600">Sorry, the page you&apos;re looking for does not exist.</p>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
