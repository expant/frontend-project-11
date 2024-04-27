export default (err) => {
  const networkError = err.name === 'AxiosError' ? 'networkError' : false;
  const invalidRSS = err.message === 'invalidRSS' ? err.message : false;
  const name = invalidRSS || networkError || 'unknownError';

  switch (name) {
    case 'networkError': return 'feedbacks.networkError';
    case 'invalidRSS': return 'feedbacks.invalidRSS';
    case 'unknownError': return 'feedbacks.unknownError';
    default: throw new Error(`Unknown error name: '${name}'!`);
  }
};
