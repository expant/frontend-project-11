import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './view/index.js';
import parse from './utils/parse.js';
import STATUS from './utils/status.js';
import getRequestArgs from './utils/getRequestArgs.js';
import getElements from './utils/getElements.js';
import getErrorKey from './utils/getErrorKey.js';
import handleModal from './utils/handleModal.js';
import watchPosts from './utils/watchPosts.js';

const validateForm = (url, watchedState, schema) => schema
  .validate({ url }, { abortEarly: false })
  .then(() => {
    watchedState.rssForm = {
      error: '',
      isValid: true,
    };
  })
  .catch((err) => {
    const [key] = err.errors;
    watchedState.rssForm = {
      error: key,
      isValid: false,
    };
    throw new Error(err);
  });

const handleResponse = (watchedState, url, res) => {
  const rss = parse(res.data.contents);
  const feedsState = watchedState.feeds;
  const feedId = feedsState.length === 0 ? 0 : feedsState.at(-1).id + 1;
  const feed = { ...rss.feed, url, id: feedId };
  watchedState.feeds.push(feed);

  if (!rss.posts) {
    throw new Error('invalidRSS');
  }
  const posts = rss.posts.map((post) => ({ ...post, feedId: feed.id }));
  const lastPost = watchedState.posts[0];
  const postsWithId = watchedState.posts.length === 0
    ? posts.map((post, i) => ({ ...post, id: i }))
    : posts.map((post, i) => ({ ...post, id: lastPost.id + (i + 1) }));
  watchedState.posts = [...postsWithId.reverse(), ...watchedState.posts];
};

const loadRSS = (watchedState, url) => {
  watchedState.loadingProcess = { error: '', status: STATUS.SENDING };
  return axios.get(...getRequestArgs(url))
    .then((res) => {
      handleResponse(watchedState, url, res);
      watchedState.loadingProcess = { error: '', status: STATUS.SUCCESS };
    })
    .catch((err) => {
      const key = getErrorKey(err);
      watchedState.loadingProcess = { error: key, status: STATUS.FAIL };
    });
};

const handleRSSForm = (elements, watchedState, schema) => {
  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const existUrl = watchedState.feeds.find((feed) => feed.url === url);
    if (existUrl) {
      watchedState.rssForm = {
        error: 'feedbacks.exist',
        isValid: false,
      };
      return;
    }

    validateForm(url, watchedState, schema)
      .then(() => loadRSS(watchedState, url))
      .then(() => handleModal(elements, watchedState))
      .catch(() => {});
  });
};

export default () => {
  yup.setLocale({
    string: {
      url: 'feedbacks.invalid',
    },
  });

  const schema = yup.object({
    url: yup.string().required().url(),
  });

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  // Model
  const initialState = {
    rssForm: {
      error: '',
      isValid: null,
    },
    loadingProcess: {
      error: '',
      status: STATUS.FILLING,
    },
    updatingProcess: {
      status: STATUS.FILLING,
    },
    feeds: [],
    posts: [],
    ui: {
      seenPosts: {
        last: null,
        all: [],
      },
    },
  };

  // View
  const watchedState = watch(i18n, initialState);

  // Controller
  watchPosts(getElements(), watchedState);
  handleRSSForm(getElements(), watchedState, schema);
};
