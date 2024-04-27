const TIMEOUT = 10000;

export default (url) => ([
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
  { timeout: TIMEOUT },
]);