import lscache from 'lscache';

export const setToken = (token) => {
  lscache.set('frontendToken', token, 2880); // expires after 2 days
}

export const unsetToken = () => {
  lscache.remove('frontendToken');
}

export const getToken = () => {
  return lscache.get('frontendToken');
}