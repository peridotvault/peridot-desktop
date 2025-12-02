
import { useEffect, useState } from "react";

export function useBlobUrl(blob?: Blob | null): string | undefined {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        if (!blob) {
            setUrl(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [blob]);

    return url;
}
