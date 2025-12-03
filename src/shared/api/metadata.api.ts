import type { Metadata } from '@shared/blockchain/icp/types/game';

const handleResponse = async (res: Response) => {
    if (res.ok) {
        return res.json();
    }

    let message = 'Failed to fetch metadata';
    try {
        const errorData = await res.json();
        if (typeof errorData.message === 'string') {
            message = errorData.message;
        } else if (Array.isArray(errorData.message)) {
            message = errorData.message.join('; ');
        }
    } catch {
        message = `Request failed: ${res.status} ${res.statusText}`;
    }

    const error = new Error(message);
    (error as any).statusCode = res.status;
    throw error;
};

export const fetchMetadata = async (url: string): Promise<Metadata> => {
    const res = await fetch(url);
    return handleResponse(res);
};
