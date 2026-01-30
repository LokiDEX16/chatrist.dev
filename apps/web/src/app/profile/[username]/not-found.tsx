import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 mb-6">
        <span className="text-white font-bold text-2xl">!</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        This profile doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        Go home
      </Link>
    </div>
  );
}
