const config = {
  API_BASE_URL: (window as any).env?.REACT_APP_API_BASE_URL || 'https://bp.backend.vananpicture.com/api',
  NODE_ENV: 'development',
};

export default config;
