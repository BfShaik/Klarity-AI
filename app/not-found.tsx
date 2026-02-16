import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-bg">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white">404</h1>
        <p className="mt-2 text-slate-400">This page could not be found.</p>
        <Link
          href="/"
          className="mt-6 inline-block btn-primary"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
