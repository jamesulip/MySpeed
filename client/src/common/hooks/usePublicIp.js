import { useEffect, useState } from 'react';
import { getPublicIpAddress } from '@/common/utils/PublicIpUtil';

/**
 * React hook to get the public IP address
 * @returns {Object} - Object containing ip, loading, and error states
 */
export const usePublicIp = () => {
    const [ip, setIp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                setLoading(true);
                setError(null);
                const publicIp = await getPublicIpAddress();
                setIp(publicIp);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch public IP:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIp();
    }, []);

    return { ip, loading, error };
};

/**
 * React hook to set the document title to the public IP address
 * @param {string} prefix - Optional prefix for the title
 * @param {string} suffix - Optional suffix for the title
 * @returns {Object} - Object containing ip, loading, and error states
 */
export const usePublicIpTitle = (prefix = "MySpeed - ", suffix = "") => {
    const { ip, loading, error } = usePublicIp();

    useEffect(() => {
        if (ip) {
            const title = `${prefix}${ip}${suffix}`;
            document.title = title;
            console.log(`Document title set to: ${title}`);
        } else if (error) {
            // Fallback to default title if IP fetching fails
            document.title = "MySpeed";
        }
    }, [ip, prefix, suffix, error]);

    return { ip, loading, error };
};
