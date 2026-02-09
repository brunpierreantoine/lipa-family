export default function HomeLoading() {
  return (
    <main className="container animate-pulse">
      <div className="headerRow">
        <div className="headerLeft">
          <div className="h-8 w-56 skeleton mb-3"></div>
          <div className="h-4 w-96 max-w-full skeletonSoft"></div>
        </div>
        <div className="headerActions">
          <div className="h-11 w-28 skeleton" style={{ borderRadius: "14px" }}></div>
        </div>
      </div>
      <div className="portalGrid">
        <div className="portalCard">
          <div className="h-10 w-10 skeletonSoft mb-4"></div>
          <div className="h-5 w-40 skeleton mb-2"></div>
          <div className="h-4 w-56 skeletonSoft"></div>
        </div>
        <div className="portalCard">
          <div className="h-10 w-10 skeletonSoft mb-4"></div>
          <div className="h-5 w-32 skeleton mb-2"></div>
          <div className="h-4 w-52 skeletonSoft"></div>
        </div>
      </div>
    </main>
  );
}
