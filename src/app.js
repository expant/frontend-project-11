import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
// import { isEmpty } from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parse from './utils/parse.js';
import STATUS from './utils/status.js';

const UPDATE_INTERVAL = 5000;
const TIMEOUT = 10000;

// const setIdOfTheUpdatedData = (data, state, feedId) => {
//   const { post } = { ...data };
//   const { posts: postsFromState } = { ...state.lists };
//   const lastPost = postsFromState[0];
//   // console.log(post);
//   return {
//     ...post,
//     id: lastPost.id + 1,
//     feedId,
//   };
// };

// const setId = (data, state) => {
//   const { feed, posts } = { ...data };
//   if (isEmpty(state.lists.feeds) && isEmpty(state.lists.posts)) {
//     const feedWithId = { ...feed, id: 0 };
//     const postsWithId = posts.map((post, i) => ({
//       ...post,
//       id: i,
//       feedId: feedWithId.id,
//     }));
//     return { feed: feedWithId, posts: postsWithId };
//   }

//   const {
//     feeds: feedsFromState,
//     posts: postsFromState,
//   } = { ...state.lists };

//   const lastFeed = feedsFromState[feedsFromState.length - 1];
//   // const lastPost = postsFromState[postsFromState.length - 1];
//   const lastPost = postsFromState[0];
//   const feedWithId = { ...feed, id: lastFeed.id + 1 };
//   const postsWithId = posts.map((post, i) => ({
//     ...post,
//     id: lastPost.id + (i + 1),
//     feedId: feedWithId.id,
//   }));
//   return { feed: feedWithId, posts: postsWithId };
// };

// const validateRSSForm = () => {

// };

const getElements = () => ({
  init: {
    title: document.querySelector('h1'),
    subtitle: document.querySelector('p.lead'),
    rssForm: {
      form: document.querySelector('.rss-form'),
      field: document.querySelector('#url-input'),
      label: document.querySelector('.form-label'),
      button: document.querySelector('.rss-form .btn'),
    },
    example: document.querySelector('.example-muted'),
    modal: {
      readCompletely: document.querySelector('.modal-footer .btn-primary'),
      close: document.querySelector('.modal-footer .btn-secondary'),
    },
  },
  modal: {
    title: document.querySelector('.modal-title'),
    description: document.querySelector('.modal-body'),
    readCompletely: document.querySelector('.modal-footer .btn-primary'),
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
  },
});

const isUrlExist = (watchedState, url) => {
  const existUrl = watchedState.feeds.find((feed) => feed.url === url);
  if (existUrl) {
    return true;
  }
  return false;
};

const validateForm = (url, watchedState, schema, cb) => schema
  .validate({ url }, { abortEarly: false })
    .then(() => {
      watchedState.rssForm = {
        error: '',
        isValid: true,
      };
      return;
    })
    .catch((err) => {
      // const name = err.inner[0].path;
      const [key] = err.errors;
      watchedState.rssForm = {
        error: key,
        isValid: false,
      };
      throw new Error(err);
    });

const getFeedId = (feedsState) => {
  if (feedsState.length === 0) {
    return 0;
  }
  const lastFeed = feedsState[feedsState.length - 1];
  const id = lastFeed.id + 1;
  return id;
}

const handleResponse = (watchedState, url, res) => {
  const rss = parse(res.data.contents);
  const feed = { 
    ...rss.feed, 
    url,
    id: getFeedId(watchedState.feeds), 
  };

  watchedState.feeds.push(feed);

  const posts = rss.posts.map((post) => ({ ...post, feedId: feed.id }));
  const lastPost = watchedState.posts[watchedState.posts.length - 1];
  const postsWithId = watchedState.posts.length === 0
    ? posts.map((post, i) => ({ ...post, id: i }))
    : posts.map((post, i) => ({ ...post, id: lastPost.id + (i + 1) }))
  watchedState.posts.push(...postsWithId);
};

const loadRSS = (watchedState, url) => {
  watchedState.loadingProcess = { error: '', status: STATUS.SENDING };

  return axios.get(
    `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
    { timeout: TIMEOUT },
  )
  .then((res) => {
    handleResponse(watchedState, url, res);
    watchedState.loadingProcess = { error: '', status: STATUS.SUCCESS };
  })
  .catch((err) => {
    if (err.name && err.name === 'AxiosError') {
      watchedState.loadingProcess = {
        error: 'feedbacks.networkError',
        status: STATUS.FAIL,
      };
      return;
    }
    const [key] = err.errors;
    watchedState.loadingProcess = {
      error: key,
      status: STATUS.FAIL,
    };
  });
};

const handleRSSForm = (elements, watchedState, schema) => {
  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    if (isUrlExist(watchedState, url)) {
      watchedState.rssForm = {
        error: 'feedbacks.exist',
        isValid: false,
      };
      return;
    }

    const promise = validateForm(url, watchedState, schema);
    promise
      .then(() => loadRSS(watchedState, url))
      .catch(() => {});
  });
};

export default () => {
  const elements = getElements();

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
    feeds: [],
    posts: [],
    ui: {
      seenPosts: [],
    },
  };

  // View
  const watchedState = watch(elements, i18n, initialState);

  // Controller
  handleRSSForm(elements, watchedState, schema);
};

// --------- URL-адреса для тестирования различных вариантов: (ошибки и тд)

// NetworkError:
// http://www.mk.ru/rss/politics/index.xml

// UnknownError:
// http://itunes.apple.com/us/rss/toptvseasons/limit=100/genre=4000/xml?at=1001l5Uo

// invalidRSS:
// https://myfin.by/rss

// Updates:
// https://lorem-rss.hexlet.app/feed?unit=second&interval=10



 // const handleError = (name, key) => {
  //   watchedState.status = 'invalid';
  //   watchedState.error = { [name]: key };
  // };

  // const handleResponse = (res, urlObj) => {
  //   const { url, contentLength, feedId } = urlObj;
  //   const { content_length: newContentLength } = res.data.status;
  //   if (contentLength === newContentLength) {
  //     return;
  //   }

  //   const parsedData = parse(res.data.contents);
  //   const newPost = parsedData.posts.find((post) => {
  //     const currentPost = watchedState.lists.posts.find(
  //       (postFromState) => postFromState.title === post.title,
  //     );

  //     return !currentPost;
  //   });

  //   const data = { feed: parsedData.feed, post: newPost };

  //   const post = setIdOfTheUpdatedData(data, watchedState, feedId);
  //   const otherUrls = watchedState.urls.filter((urlItem) => urlItem.feedId !== feedId);
  //   const newUrl = { url, contentLength: newContentLength, feedId };

  //   watchedState.urls = [...otherUrls, newUrl];
  //   watchedState.lists.posts = [post, ...watchedState.lists.posts];
  //   watchedState.status = 'updated';
  // };

  // const handleModal = () => {
  //   const { list } = elements.posts;
  //   const readPostsElements = list.querySelectorAll('li');
  //   const updateStateOfReadPosts = (event) => {
  //     if (!event.target.dataset.id) {
  //       return;
  //     }
  //     const postId = parseInt(event.target.dataset.id, 10);
  //     const currentPost = watchedState.lists.posts.find((post) => post.id === postId);
  //     const otherPosts = watchedState.uiState.readPosts.filter((post) => post.id !== postId);
  //     watchedState.uiState.readPosts = [...otherPosts, currentPost];
  //   };

  //   readPostsElements.forEach((readPostEl) => {
  //     readPostEl.addEventListener('click', (e) => updateStateOfReadPosts(e));
  //   });
  // };

  // const updatePosts = () => watchedState.urls.forEach((urlObj) => {
  //   makeRequest(urlObj.url)
  //     .then((res) => handleResponse(res, urlObj))
  //     .then(() => handleModal())
  //     .catch(() => handleError('networkError', 'feedbacks.networkError'));
  // });

  // const watchPosts = () => {
  //   if (watchedState.urls.length === 0) {
  //     return setTimeout(watchPosts, UPDATE_INTERVAL);
  //   }
  //   updatePosts();
  //   return setTimeout(watchPosts, UPDATE_INTERVAL);
  // };
  // watchPosts();








// watchedState.status = 'sending';
    // schema.validate({ url }, { abortEarly: false })
    //   // sending a request
    //   .then(() => {
    //     const existingUrl = watchedState.urls.find((currentUrl) => currentUrl.url === url);
    //     if (existingUrl) {
    //       watchedState.error = { exist: 'feedbacks.exist' };
    //       watchedState.status = 'invalid';
    //       return;
    //     }

    //     watchedState.error = {};
    //     watchedState.status = 'valid';
    //     return makeRequest(url);
    //   })
    //   .catch((err) => {
    //     if (err.name && err.name === 'AxiosError') {
    //       handleError('networkError', 'feedbacks.networkError');
    //       return;
    //     }
    //     if (!err.inner) return;
    //     const name = err.inner[0].path;
    //     const [key] = err.errors;
    //     handleError(name, key);
    //   })
    //   // Parsing
    //   .then((res) => {
    //     if (!res) return;
    //     const parsedData = parse(res.data.contents);
    //     if (isEmpty(parsedData)) {
    //       watchedState.status = 'invalid';
    //       watchedState.error = { invalidRSS: 'feedbacks.invalidRSS' };
    //       return;
    //     }

    //     const { feed, posts } = setId(parsedData, watchedState);
    //     const { content_length: contentLength } = res.data.status;
    //     watchedState.urls.push({ url, contentLength, feedId: feed.id });
    //     watchedState.lists.feeds = [feed, ...watchedState.lists.feeds];
    //     watchedState.lists.posts = [...posts.reverse(), ...watchedState.lists.posts];
    //     watchedState.status = 'finished';
    //   })
    //   .catch(() => handleError('unknownError', 'feedbacks.unknownError'))
    //   .then(() => {
    //     const { list } = elements.posts;
    //     if (list.childNodes.length === 0) {
    //       return;
    //     }
    //     handleModal();
    //   });