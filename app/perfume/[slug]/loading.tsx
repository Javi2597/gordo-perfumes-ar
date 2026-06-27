export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-3 w-40 bg-ink/[0.06] animate-pulse" />
          <div className="h-3 w-12 bg-ink/[0.06] animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Image */}
          <div
            className="w-full md:w-1/2 shrink-0 bg-ink/[0.06] animate-pulse"
            style={{ aspectRatio: '4/5' }}
          />

          {/* Details */}
          <div className="flex flex-col flex-1 gap-4">
            <div className="h-3 w-24 bg-ink/[0.06] animate-pulse" />
            <div className="h-8 w-3/4 bg-ink/[0.06] animate-pulse" />
            <div className="h-3 w-full bg-ink/[0.06] animate-pulse mt-2" />
            <div className="h-3 w-5/6 bg-ink/[0.06] animate-pulse" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-6 w-16 bg-ink/[0.06] animate-pulse" />
              <div className="h-6 w-16 bg-ink/[0.06] animate-pulse" />
              <div className="h-6 w-16 bg-ink/[0.06] animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-ink/[0.06] animate-pulse mt-4" />
            <div className="h-12 w-full bg-ink/[0.06] animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </main>
  )
}
