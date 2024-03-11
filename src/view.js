import onChange from 'on-change';
import { isEmpty } from 'lodash';

const renderInitText = (elements, t) => {
  elements.title.textContent = t('title');
  elements.subtitle.textContent = t('subtitle');
  elements.rssForm.label.textContent = t('rssForm.label');
  elements.rssForm.button.textContent = t('rssForm.button');
  elements.example.textContent = t('example');
  elements.modal.readCompletely.textContent = t('modal.readCompletely');
  elements.modal.close.textContent = t('modal.close');
};

const renderError = (elements, t, error) => {
  if (isEmpty(error)) {
    return;
  }
  const { feedback } = elements;
  const { field } = elements.init.rssForm;
  const [, pathToFeedbackText] = Object.entries(error).flatMap((err) => err);

  field.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = t(pathToFeedbackText);
};

const renderFeed = (elements, t, watchedState) => {
  const { feeds } = elements;
  const feedsListElement = feeds.list;
  const firstFeed = watchedState.lists.feeds[0];
  const { title, description } = firstFeed;
  const feedElement = document.createElement('li');
  const titleElement = document.createElement('h3');
  const descriptionElement = document.createElement('p');

  feeds.title.textContent = t('feeds');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
  titleElement.classList.add('h6', 'm-0');
  descriptionElement.classList.add('m-0', 'small', 'text-black-50');
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  feedElement.append(titleElement);
  feedElement.append(descriptionElement);
  feedsListElement.prepend(feedElement);
};

const renderPosts = (args) => {
  const { elements, t, postsState, readPostsState} = args;
  const { posts } = elements;
  posts.title.textContent = t('posts');
  const postsListElement = posts.list;

  postsListElement.innerHTML = '';
  postsState.forEach((post) => {
    const { id, title, link } = post;
    const postElement = document.createElement('li');
    const titleElement = document.createElement('a');
    const button = document.createElement('button');
    const currentReadPost = readPostsState.find((readPost) => readPost.id === id);

    postElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    if (currentReadPost) {
      titleElement.classList.add('fw-normal', 'link-secondary');
    } else {
      titleElement.classList.add('fw-bold');
    }
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    titleElement.setAttribute('href', link);
    titleElement.setAttribute('data-id', id);
    titleElement.setAttribute('target', '_blank');
    titleElement.setAttribute('rel', 'noopener noreferrer');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-bs-toggle', 'modal');
    titleElement.textContent = title;
    button.textContent = 'Просмотр';
    postElement.append(titleElement);
    postElement.append(button);
    postsListElement.append(postElement);
  });
};

const handleReadPosts = (elements, watchedState) => {
  const {
    title: modalElTitle,
    description: modalElDesc,
    readCompletely,
  } = elements.modal;
  const { list } = elements.posts;
  const postElements = Array.from(list.querySelectorAll('li'));
  const post = watchedState.uiState.readPosts[
    watchedState.uiState.readPosts.length - 1
  ];
  const { title, description, link, id } = post;
  const readPostElement = postElements.find((postEl) => {
    const btnEl = postEl.querySelector('button');
    return parseInt(btnEl.dataset.id, 10) === id;
  });
  const linkEl = readPostElement.querySelector('a');

  linkEl.classList.remove('fw-bold');
  linkEl.classList.add('fw-normal', 'link-secondary');
  modalElTitle.textContent = title;
  modalElDesc.textContent = description;
  readCompletely.setAttribute('href', link);
}

const handleSendingStatus = (feedback, field, button) => {
  field.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  button.setAttribute('disabled', '');
  field.setAttribute('readonly', '');
  feedback.textContent = '';
};

const handleFinishedStatus = (feedback, field, button, t) => {
  feedback.textContent = t('feedbacks.success');
  feedback.classList.add('text-success');
  field.removeAttribute('readonly');
  button.removeAttribute('disabled');
  field.classList.remove('is-invalid');
  field.focus();
  field.value = '';
};

const handleInvalidStatus = (field, button) => {
  field.removeAttribute('readonly');
  button.removeAttribute('disabled');
};

export default (elements, i18n, initialState) => {
  const { t } = i18n;
  renderInitText(elements.init, t);

  const watchedState = onChange(initialState, (path, value) => {
    switch (path) {
      case 'error': {
        renderError(elements, t, value);
        return;
      }
      case 'lists.posts': {
        renderPosts({
          elements,
          t,
          postsState: watchedState.lists.posts,
          readPostsState: watchedState.uiState.readPosts,
        });
        return;
      }
      case 'lists.feeds': {
        renderFeed(elements, t, watchedState);
        return;
      }
      case 'uiState.readPosts': {
        handleReadPosts(elements, watchedState);
        return;
      }
      default: console.log(`Unknown path ${path}: ${value}`);
    }
    
    const { feedback } = elements;
    const { field, button } = elements.init.rssForm;
    switch (watchedState.status) {
      case 'sending': {
        handleSendingStatus(feedback, field, button);
        break;
      }
      case 'finished': {
        handleFinishedStatus(feedback, field, button, t);
        break;
      }
      case 'invalid': {
        handleInvalidStatus(field, button);
        return;
      }
      default: console.log(`Unknown status ${watchedState.status}`);
    }
  });
  return watchedState;
};
