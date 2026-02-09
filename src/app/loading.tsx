export default function Loading() {
    return (
        <main className="container animate-pulse">
            {/* Header Skeleton */}
            <div className="headerRow">
                <div className="headerLeft">
                    <div className="h-8 w-48 skeleton mb-3" style={{ borderRadius: '12px' }}></div>
                    <div className="h-4 w-96 max-w-full skeletonSoft"></div>
                </div>
                <div className="headerActions flex gap-3">
                    <div className="h-11 w-32 skeleton" style={{ borderRadius: '14px' }}></div>
                    <div className="h-11 w-11 skeleton" style={{ borderRadius: '14px' }}></div>
                    <div className="h-11 w-11 skeleton" style={{ borderRadius: '14px' }}></div>
                </div>
            </div>

            {/* Portal Grid Skeleton */}
            <div className="portalGrid mt-8">
                {[1, 2].map((i) => (
                    <div key={i} className="portalCard opacity-60">
                        <div className="h-14 w-14 skeleton mb-5" style={{ borderRadius: '20px' }}></div>
                        <div className="h-7 w-40 skeleton mb-3"></div>
                        <div className="h-4 w-full skeletonSoft mb-1"></div>
                        <div className="h-4 w-2/3 skeletonSoft"></div>
                    </div>
                ))}
            </div>
        </main>
    );
}
