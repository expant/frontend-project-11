import onChange from 'on-change';
import STATUS from '../utils/status.js';
import getElements from '../utils/getElements.js';
import {
  handleSucessStatus,
  renderValid,
  renderError,
  lockTheForm,
} from './components/form.js';
import renderInitText from './components/renderInitText.js';
import renderFeed from './components/renderFeed.js';
import renderPosts from './components/renderPosts.js';
import renderModal from './components/renderModal.js';

const changeClassOfSeenPost = (elements, id) => {
  const { list } = elements.posts;
  const element = list.querySelector(`li > a[data-id="${id}"]`);
  element.classList.remove('fw-bold');
  element.classList.add('fw-normal', 'link-secondary');
};

const handleLoadingProcess = (elements, state, value, t) => {
  const { rssForm } = elements.init;
  const { feedback } = elements;
  const { status } = value;

  switch (status) {
    case STATUS.FAIL:
      renderError(elements, t, state.loadingProcess.error);
      break;
    case STATUS.SENDING:
      lockTheForm(rssForm, feedback);
      break;
    case STATUS.SUCCESS: {
      handleSucessStatus(rssForm, feedback, t);
      const args = {
        elements,
        t,
        postsState: state.posts,
        seenPosts: state.ui.seenPosts,
      };
      renderFeed(elements, t, state);
      renderPosts(args);
      break;
    }
    default:
      throw new Error(`Unknown status: '${status}'!`);
  }
};

const handleStateByPath = (args) => {
  const {
    path, value, t, state, elements,
  } = args;

  switch (path) {
    case 'rssForm': {
      if (!value.isValid) {
        renderError(elements, t, value.error);
        return;
      }
      renderValid(elements);
      break;
    }
    case 'ui.seenPosts': {
      const id = state.ui.seenPosts.last;
      changeClassOfSeenPost(elements, id);
      renderModal(elements, state, id);
      break;
    }
    case 'loadingProcess':
      handleLoadingProcess(elements, state, value, t);
      break;
    case 'updatingProcess': {
      const { status } = value;

      if (status === STATUS.SUCCESS) {
        const postsArgs = {
          elements,
          t,
          postsState: state.posts,
          seenPosts: state.ui.seenPosts,
        };
        renderPosts(postsArgs);
      }
      break;
    }
    case 'feeds': break;
    case 'posts': break;
    default:
      throw new Error(`Unknown path: '${path}'!`);
  }
};

export default (t, initialState) => {
  const elements = getElements();
  renderInitText(elements.init, t);

  const state = onChange(initialState, (path, value) => {
    const args = {
      path,
      value,
      t,
      state,
      elements,
    };
    handleStateByPath(args);
  });
  return state;
};
