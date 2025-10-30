export async function runPool<T, R>(
    items: T[],
    limit: number,
    worker: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
    const results: R[] = [];
    let index = 0;

    const runners = new Array(Math.min(limit, Math.max(items.length, 1))).fill(0).map(async () => {
        while (index < items.length) {
            const currentIndex = index++;
            results[currentIndex] = await worker(items[currentIndex], currentIndex);
        }
    });

    await Promise.all(runners);
    return results;
}
