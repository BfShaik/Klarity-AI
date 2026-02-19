import Link from "next/link";
import { NotFoundPathDisplay } from "@/components/404PathDisplay";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-bg">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white">404</h1>
        <p className="mt-2 text-slate-400">This page could not be found.</p>
        <NotFoundPathDisplay />
        <Link href="/" className="mt-6 inline-block btn-primary">
          Go to dashboard
        </Link>
        <p className="mt-4 text-sm text-slate-500">
          Not signed in? <Link href="/login" className="text-red-400 hover:text-red-300">Sign in</Link> first.
        </p>
      </div>
    </div>
  );
}
