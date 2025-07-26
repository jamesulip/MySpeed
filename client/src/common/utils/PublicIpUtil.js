/**
 * Utility function to fetch and set the public IP address as the document title
 */

/**
 * Fetches the public IP address from external services
 * @returns {Promise<string>} The public IP address
 */
export const getPublicIpAddress = async () => {
    // First try the server-side endpoint (internal, faster, no CORS issues)
    try {
        const response = await fetch('/api/info/public-ip', {
            method: 'GET',
            timeout: 3000 // 3 second timeout for internal endpoint
        });

        if (response.ok) {
            const data = await response.json();
            if (data.ip && isValidIpAddress(data.ip)) {
                return data.ip;
            }
        }
    } catch (error) {
        console.warn('Failed to fetch IP from internal endpoint:', error);
    }

    // List of public IP services to try (in order of preference)
    const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip',
        'https://ip-api.com/json/',
        'https://ifconfig.me/all.json'
    ];

    for (const service of ipServices) {
        try {
            const response = await fetch(service, {
                method: 'GET',
                timeout: 5000 // 5 second timeout
            });

            if (!response.ok) {
                continue; // Try next service
            }

            const data = await response.json();
            
            // Extract IP from different response formats
            const ip = data.ip || data.query || data.origin || data.IPv4 || null;
            
            if (ip && isValidIpAddress(ip)) {
                return ip;
            }
        } catch (error) {
            console.warn(`Failed to fetch IP from ${service}:`, error);
            // Continue to next service
        }
    }

    // If all services fail, return a fallback
    throw new Error('Unable to fetch public IP address from any service');
};

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 * @param {string} ip - The IP address to validate
 * @returns {boolean} - True if valid IP address
 */
const isValidIpAddress = (ip) => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Sets the document title to the public IP address
 * @param {string} prefix - Optional prefix for the title (default: "MySpeed - ")
 * @returns {Promise<void>}
 */
export const setTitleToPublicIp = async (prefix = "MySpeed - ") => {
    try {
        const publicIp = await getPublicIpAddress();
        document.title = `${prefix}${publicIp}`;
        console.log(`Document title set to: ${document.title}`);
    } catch (error) {
        console.error('Failed to set title to public IP:', error);
        // Keep the default title if fetching IP fails
        document.title = "MySpeed";
    }
};

/**
 * Sets the document title to the public IP address with custom formatting
 * @param {Object} options - Configuration options
 * @param {string} options.prefix - Prefix for the title
 * @param {string} options.suffix - Suffix for the title
 * @param {string} options.separator - Separator between prefix, IP, and suffix
 * @returns {Promise<void>}
 */
export const setTitleToPublicIpCustom = async (options = {}) => {
    const {
        prefix = "",
        suffix = "",
        separator = " "
    } = options;

    try {
        const publicIp = await getPublicIpAddress();
        const titleParts = [prefix, publicIp, suffix].filter(part => part).join(separator);
        document.title = titleParts || "MySpeed";
        console.log(`Document title set to: ${document.title}`);
    } catch (error) {
        console.error('Failed to set title to public IP:', error);
        // Keep the default title if fetching IP fails
        document.title = "MySpeed";
    }
};
