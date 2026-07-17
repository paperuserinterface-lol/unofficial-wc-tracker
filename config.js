// API configuration

const APP_CONFIG = {
    LOCAL_API_BASE_URL: 'http://localhost:3000',
    PRODUCTION_API_BASE_URL: 'https://unofficial-wc-tracker-production.up.railway.app'
};

function getApiBaseUrl() {
    const { protocol, hostname, port } = window.location;

    const isLocalFile = protocol === 'file:';
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isNodeLocalhost = isLocalHost && port === '3000';
    const isRailwayHost = hostname === 'unofficial-wc-tracker-production.up.railway.app';

    if (isRailwayHost || isNodeLocalhost) {
        return '';
    }

    if (isLocalFile || isLocalHost) {
        return APP_CONFIG.LOCAL_API_BASE_URL;
    }

    return APP_CONFIG.PRODUCTION_API_BASE_URL;
}

function apiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${normalizedPath}`;
}
