import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center">
        {/* Avatar skeleton */}
        <Skeleton className="h-24 w-24 rounded-full" />

        {/* Name skeleton */}
        <Skeleton className="mt-5 h-6 w-40" />

        {/* Username skeleton */}
        <Skeleton className="mt-2 h-4 w-24" />

        {/* Bio skeleton */}
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-1 h-4 w-48" />

        {/* Link skeletons */}
        <div className="mt-8 w-full space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
