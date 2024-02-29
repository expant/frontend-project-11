import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { isEmpty, sortBy } from 'lodash';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './utils/parse.js';

const UPDATE_INTERVAL = 5000;
const TIMEOUT = 10000;

yup.setLocale({
  string: {
    url: 'feedbacks.invalid',
  },
});

const schema = yup.object({
  url: yup.string().required().url(),
});

const makeRequest = (url) => axios.get(
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
  { timeout: TIMEOUT },
);

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

const setIdOfTheUpdatedData = (data, state, feedId) => {
  const { posts } = {...data};
  const { posts: postsFromState } = {...state.lists};
  const lastPost = postsFromState[postsFromState.length - 1];
  const postsWithId = posts.map((post, i) => ({ 
    ...post, 
    id: lastPost.id + (i + 1), 
    feedId,
  }));
  return { posts: postsWithId };
};

const setId = (data, state) => {
  const { feed, posts } = {...data};
  if (isEmpty(state.lists.feeds) && isEmpty(state.lists.posts)) {
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
    lists: {
      feeds: [],
      posts: [],
    },
    uiState: {
      posts: [],
    }
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
  const handleError = (name, key) => {
    watchedState.status = 'invalid';
    watchedState.error = { [name]: key };
  };

  const updatePosts = () => watchedState.urls
    .forEach(({ url, contentLength, feedId }) => {
      makeRequest(url).then((res) => {
        const { content_length: newContentLength } = res.data.status;
        if (contentLength === newContentLength) {
          return;
        }

        const parsedData = parse(res.data.contents);
        const { posts } = setIdOfTheUpdatedData(parsedData, watchedState, feedId);
        const isNotEqual = (obj) => obj.feedId !== feedId;
        const otherPosts = watchedState.lists.posts.filter(isNotEqual);
        const otherUrls = watchedState.urls.filter(isNotEqual);
        const newUrl = { url, contentLength: newContentLength, feedId };
        watchedState.urls = [...otherUrls, newUrl];
        watchedState.lists.posts = [ ...posts, ...otherPosts ];
        // watchedState.uiState.posts = [
        //   ...watchedState.uiState.posts, 
        //   ...posts.map((post) => ({ id: post.id, viewed: false })),
        // ];
        watchedState.status = 'updated';
      });
    }); 

  const watchPosts = () => {
    if (watchedState.urls.length === 0) {
      return setTimeout(watchPosts, UPDATE_INTERVAL);
    }
    updatePosts();
    return setTimeout(watchPosts, UPDATE_INTERVAL);
  };
  watchPosts();

  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.status = 'sending';

    schema.validate({ url }, { abortEarly: false })
      // sending a request
      .then(() => {
        const existingUrl = watchedState.urls.find((currentUrl) => currentUrl.url === url);
        if (existingUrl) {
          watchedState.error = { exist: 'feedbacks.exist' };
          watchedState.status = 'invalid';
          return;
        }
        
        watchedState.error = {};
        watchedState.status = 'valid';
        return makeRequest(url);
      })
      .catch((err) => {
        if (err.name || err.name === 'AxiosError') {
          handleError('networkError', 'feedbacks.networkError');
          return;
        }
        if (!err.inner) return;
        const name = err.inner[0].path;
        const [key] = err.errors;
        handleError(name, key);
      })
      // Parsing
      .then((res) => {
        if (!res) return;
        const parsedData = parse(res.data.contents);
        if (isEmpty(parsedData)) {
          watchedState.status = 'invalid';
          watchedState.error = { invalidRSS: 'feedbacks.invalidRSS' };
          return;
        }

        const { feed, posts } = setId(parsedData, watchedState);
        const { content_length: contentLength } = res.data.status;
        watchedState.urls.push({ url, contentLength, feedId: feed.id });
        watchedState.lists.feeds = [...watchedState.lists.feeds, feed];
        watchedState.lists.posts = [...watchedState.lists.posts, ...posts];
        watchedState.uiState.posts = [
          ...watchedState.uiState.posts, 
          ...posts.map((post) => ({ id: post.id, viewed: false })),
        ];
        watchedState.status = 'finished';
      })
      .catch(() => handleError('unknownError', 'feedbacks.unknownError'));  
 
    const { list } = elements.posts;
    if (list.childNodes.length === 0) {
      return;
    }

    const postViewBtns = list.querySelectorAll('li > button');
    postViewBtns.forEach((postViewBtn) => {
      postViewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(e.target);
      });
    });
  });
};

// NetworkError: 
// http://www.mk.ru/rss/politics/index.xml

// UnknownError:
// http://itunes.apple.com/us/rss/toptvseasons/limit=100/genre=4000/xml?at=1001l5Uo

// Updates:
// https://lorem-rss.hexlet.app/feed?unit=second&interval=5