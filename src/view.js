import onChange from 'on-change';
import { isEmpty } from 'lodash';

const renderText = (elements, t) => {
  elements.title.textContent = t('title');
  elements.subtitle.textContent = t('subtitle');
  elements.rssForm.label.textContent = t('rssForm.label');
  elements.rssForm.button.textContent = t('rssForm.button');
  elements.example.textContent = t('example');
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

const renderFeed = (feedsListElement, feed) => {
  const { title, description } = feed;

  const feedElement = document.createElement('li');
  const titleElement = document.createElement('h3');
  const descriptionElement = document.createElement('p');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
  titleElement.classList.add('h6', 'm-0');
  descriptionElement.classList.add('m-0', 'small', 'text-black-50');
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  feedElement.append(titleElement);
  feedElement.append(descriptionElement);
  feedsListElement.append(feedElement);
};

const renderPosts = (postsListElement, postsState) => {
  postsListElement.innerHTML = '';
  console.log(postsState);
  postsState.forEach((post) => {
    const { id, title, description, link } = post;

    const postElement = document.createElement('li');
    const titleElement = document.createElement('a');
    const button = document.createElement('button');

    postElement.classList.add(
      'list-group-item', 
      'd-flex', 
      'justify-content-between', 
      'align-items-start', 
      'border-0', 
      'border-end-0'
    );
    titleElement.classList.add('fw-bold');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    titleElement.setAttribute('href', link);
    titleElement.setAttribute('data-id', 'id');
    titleElement.setAttribute('target', '_blank');
    titleElement.setAttribute('rel', 'noopener noreferrer');
    button.setAttribute('data-id', 'id');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-bs-toggle', 'modal');
    titleElement.textContent = title;
    button.textContent = 'Просмотр';
    postElement.append(titleElement);
    postElement.append(button);
    postsListElement.append(postElement);
  });
}

const renderRSS = (elements, t, state) => {
  const { posts, feeds } = elements;

  posts.title.textContent = t('posts');
  feeds.title.textContent = t('feeds');
  const postsListElement = posts.list;
  const feedsListElement = feeds.list;
  const lastFeed = state.feeds[state.feeds.length - 1];
  renderFeed(feedsListElement, lastFeed);
  renderPosts(postsListElement, state.posts);
};

export default (elements, i18n, initialState) => {
  const { t } = i18n;
  const { feedback } = elements;
  const { field, button } = elements.init.rssForm;
  renderText(elements.init, t);

  const watchedState = onChange(initialState, (path, value) => {  
    switch (path) {
      case 'error': {
        renderError(elements, t, value);
        break;
      }
      case 'lists.posts': {
        const { posts } = elements;
        posts.title.textContent = t('posts');
        const postsListElement = posts.list;
        console.log(postsListElement, watchedState.lists.posts)
        renderPosts(postsListElement, watchedState.lists.posts);
        break;
      }
      case 'lists.feeds': {
        const { feeds } = elements;
        feeds.title.textContent = t('feeds');
        const feedsListElement = feeds.list;
        const lastFeed = watchedState.lists.feeds[watchedState.lists.feeds.length - 1];
        console.log(feedsListElement, lastFeed, watchedState.lists.feeds);
        renderFeed(feedsListElement, lastFeed);
        return;
      }
      default: console.log(`Unknown path ${path}`);     
    }

    switch (watchedState.status) {
      case 'sending': {
        field.classList.remove('is-invalid');
        feedback.classList.remove('text-danger');
        button.setAttribute('disabled', '');
        field.setAttribute('readonly', '');
        feedback.textContent = '';
        break;
      }
      case 'finished': {
        feedback.textContent = t('feedbacks.success');
        feedback.classList.add('text-success');
        field.removeAttribute('readonly');
        button.removeAttribute('disabled');
        field.classList.remove('is-invalid');
        field.focus();
        field.value = '';
        break;
      }
      case 'invalid': {
        field.removeAttribute('readonly');
        button.removeAttribute('disabled');
        return;
      }
      default: console.log(`Unknown status ${watchedState.status}`);     
    }

    // if (watchedState.status === 'updated') {
    //   console.log(watchedState.status);
    //   return;
    // }


  });

  return watchedState;
};

