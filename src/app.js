import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { isEmpty } from 'lodash';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './utils/parse.js';
// import watchUpdates from './utils/watchUpdates.js';

yup.setLocale({
  string: {
    url: 'feedbacks.invalid',
  },
});

const schema = yup.object({
  url: yup.string().required().url(),
});

const getElements = () => ({
  init: {
    title: document.querySelector('h1'),
    subtitle: document.querySelector('p.lead'),
    rssForm: {
      form: document.querySelector('.rss-form'),
      field: document.querySelector('#url-input'),
      label: document.querySelector('.form-label'),
      button: document.querySelector('.btn'),
    },
    example: document.querySelector('.example-muted'),
  },
  feedback: document.querySelector('.feedback'),
  posts: {
    parent: document.querySelector('.posts'),
    title: document.querySelector('.posts h2'),
    list: document.querySelector('.posts ul'),
  },
  feeds: {
    parent: document.querySelector('.feeds'),
    title: document.querySelector('.feeds h2'),
    list: document.querySelector('.feeds ul'),
  }
});

const setId = (data, state) => {
  const { feed, posts } = {...data};
  if (isEmpty(state.lists)) {
    const feedWithId = { ...feed, id: 0 };
    const postsWithId = posts.map((post, i) => ({
      ...post,
      id: i,
      feedId: feedWithId.id,
    }));
    return { feed: feedWithId, posts: postsWithId };
  }

  const { 
    feeds: feedsFromState, 
    posts: postsFromState, 
  } = {...state.lists};

  const lastFeed = feedsFromState[feedsFromState.length - 1];
  const lastPost = postsFromState[postsFromState.length - 1];
  const feedWithId = { ...feed, id: lastFeed.id + 1 };
  const postsWithId = posts.map((post, i) => ({ 
    ...post, 
    id: lastPost.id + (i + 1), 
    feedId: feedWithId.id,
  }));
  return { feed: feedWithId, posts: postsWithId };
};

export default () => {
  const elements = getElements();
  // Model
  const initialState = {
    status: 'filling',
    urls: [],
    error: {},
    lists: {},
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  // View
  const watchedState = watch(elements, i18n, initialState);

  // Controller
  // watchUpdates(urls, lists, watchedState);
  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.status = 'sending';

    schema.validate({ url }, { abortEarly: false })
      // sending a request
      .then(() => {
        if (watchedState.urls.includes(url)) {
          watchedState.error = { exist: 'feedbacks.exist' };
          watchedState.status = 'invalid';
          return;
        }
        
        watchedState.error = {};
        watchedState.status = 'valid';
        const allOriginsUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
        return axios.get(allOriginsUrl);
      })
      .catch((err) => {
        if (!err.inner) return;
        const errorName = err.inner[0].path;
        const [errorKey] = err.errors;
        watchedState.status = 'invalid';
        watchedState.error = { [errorName]: errorKey };
      })
      // Parsing
      .then((res) => {
        if (!res) return;
        console.log(res.config.url);
        const parsedData = parse(res.data.contents);

        if (isEmpty(parsedData)) {
          watchedState.status = 'invalid';
          watchedState.error = { invalidRSS: 'feedbacks.invalidRSS' };
          return;
        }

        const { feed, posts } = setId(parsedData, watchedState);

        if (isEmpty(watchedState.lists)) {
          watchedState.lists.feeds = [];
          watchedState.lists.posts = [];
        }
        
        watchedState.urls.push(url);
        watchedState.lists.feeds.push(feed);
        watchedState.lists.posts.push(...posts);
        watchedState.status = 'finished';
      })
      .catch((err) => {
        watchedState.status = 'invalid';
        watchedState.error = { unknownError: 'feedbacks.unknownError' };
      });      
  });
};



// NetworkError: 
// http://www.mk.ru/rss/politics/index.xml

  // setTimeout(() => {
  //   if (!res) {
  //     watchedState.status = 'invalid';
  //     watchedState.error = { networkError: 'feedbacks.networkError' };
  //     console.log('5s');
  //     return;
  //   }
  // }, 1000);