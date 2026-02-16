export default function ServiceUnavailablePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-bg">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-white">Service temporarily unavailable</h1>
        <p className="mt-2 text-slate-400">
          We&apos;re having an internal issue. We&apos;re working to fix it — please check back later.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/"
            className="btn-primary"
          >
            Try again
          </a>
        </div>
      </div>
    </div>
  );
}
