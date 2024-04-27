import axios from 'axios';
import parse from './parse.js';
import STATUS from './status.js';
import handleModal from './handleModal.js';
import getRequestArgs from './getRequestArgs.js';

const UPDATE_INTERVAL = 5000;

const updatePosts = (watchedState, url, res) => {
  const rss = parse(res.data.contents);
  const feed = watchedState.feeds.find((item) => item.url === url);
  const existingTitles = watchedState.posts
    .filter((post) => post.feedId === feed.id)
    .map((post) => post.title);
  const newPosts = rss.posts.filter(({ title }) => !existingTitles.includes(title));

  if (newPosts.length === 0) {
    return;
  }

  const lastPost = watchedState.posts[0];
  const newPostsWithId = newPosts.map((post, i) => ({
    ...post,
    feedId: feed.id,
    id: lastPost.id + (i + 1),
  }));
  watchedState.posts = [...newPostsWithId.reverse(), ...watchedState.posts];
};

const watchPosts = (elements, watchedState) => {
  if (watchedState.feeds.length === 0) {
    return setTimeout(() => watchPosts(elements, watchedState), UPDATE_INTERVAL);
  }

  const promises = watchedState.feeds.map(({ url }) => {
    watchedState.updatingProcess = { status: STATUS.SENDING };
    return axios.get(...getRequestArgs(url))
      .then((res) => updatePosts(watchedState, url, res))
      .catch(() => {});
  });

  return Promise.all(promises).then(() => {
    watchedState.updatingProcess = { status: STATUS.SUCCESS };
    handleModal(elements, watchedState);
    return setTimeout(() => watchPosts(elements, watchedState), UPDATE_INTERVAL);
  });
};

export default watchPosts;
