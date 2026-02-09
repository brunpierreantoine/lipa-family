export default function Loading() {
    return (
        <main className="container animate-pulse">
            {/* Header Skeleton */}
            <div className="headerRow">
                <div className="headerLeft">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-4 w-96 max-w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="headerActions flex gap-3">
                    <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
            </div>

            {/* Portal Grid Skeleton */}
            <div className="portalGrid mt-8">
                {[1, 2].map((i) => (
                    <div key={i} className="portalCard opacity-60">
                        <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-5"></div>
                        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
                        <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                ))}
            </div>
        </main>
    );
}
