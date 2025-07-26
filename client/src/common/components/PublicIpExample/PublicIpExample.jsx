import React from 'react';
import { usePublicIp, usePublicIpTitle } from '@/common/hooks/usePublicIp';
import { setTitleToPublicIp, setTitleToPublicIpCustom } from '@/common/utils/PublicIpUtil';

/**
 * Example component demonstrating how to use the public IP functionality
 */
export const PublicIpExample = () => {
    // Using the hook to get IP and display it
    const { ip, loading, error } = usePublicIp();

    // Using the hook to automatically set the title
    // const { ip: titleIp } = usePublicIpTitle("MySpeed - ", " (Public IP)");

    const handleSetSimpleTitle = () => {
        setTitleToPublicIp("MySpeed - ");
    };

    const handleSetCustomTitle = () => {
        setTitleToPublicIpCustom({
            prefix: "🌐 MySpeed",
            suffix: "(Public IP)",
            separator: " - "
        });
    };

    const handleResetTitle = () => {
        document.title = "MySpeed";
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '8px' }}>
            <h3>Public IP Address Functions</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <h4>Current Public IP:</h4>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {ip && <p style={{ fontWeight: 'bold', color: 'green' }}>{ip}</p>}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <h4>Title Control:</h4>
                <button onClick={handleSetSimpleTitle} style={{ margin: '5px' }}>
                    Set Simple Title
                </button>
                <button onClick={handleSetCustomTitle} style={{ margin: '5px' }}>
                    Set Custom Title
                </button>
                <button onClick={handleResetTitle} style={{ margin: '5px' }}>
                    Reset Title
                </button>
            </div>

            <div>
                <h4>Current Title:</h4>
                <p style={{ fontStyle: 'italic' }}>{document.title}</p>
            </div>
        </div>
    );
};
