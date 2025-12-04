// src/features/download/components/DownloadCenter.tsx

export function DownloadCenter() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Downloads</h1>

      <div className="border border-zinc-800 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">title</div>
            <div className="text-xs text-zinc-400">
              {'NICE'} • {Math.round(3 * 100)}%
            </div>
          </div>
        </div>

        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-zinc-100 transition-all" style={{ width: `${3 * 100}%` }} />
        </div>

        <div className="text-[10px] text-zinc-500">
          {(10000 / 1024 / 1024).toFixed(1)} MB / {(10000 / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>
    </div>
  );
}
