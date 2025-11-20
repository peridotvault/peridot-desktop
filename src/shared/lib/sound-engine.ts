let audioCtx: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let loadingPromise: Promise<void> | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        const AC = (window.AudioContext || (window as any).webkitAudioContext);
        audioCtx = new AC();
    }
    return audioCtx!;
}

export async function preloadClickSound(url: string) {
    const ctx = getAudioContext();

    // kalau sudah pernah decode, skip
    if (clickBuffer) return;

    // lagi loading? tunggu yang sudah ada
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        clickBuffer = await ctx.decodeAudioData(arr);
    })();

    return loadingPromise;
}

export async function playClickBuffer(volume: number) {
    const ctx = getAudioContext();

    // pastikan context resume (beberapa browser suspend sampai ada gesture)
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }

    if (!clickBuffer) return;

    const src = ctx.createBufferSource();
    const gain = ctx.createGain();

    src.buffer = clickBuffer;
    gain.gain.value = volume;

    src.connect(gain);
    gain.connect(ctx.destination);

    // start secepat mungkin
    src.start(ctx.currentTime);
}
