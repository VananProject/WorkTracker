const config = {
  API_BASE_URL: (window as any).env?.REACT_APP_API_BASE_URL || 'http://3.6.23.137:5000/api',
  NODE_ENV: 'development',
};

export default config;
