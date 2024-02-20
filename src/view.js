import onChange from 'on-change';

const renderText = (elements, t) => {
  elements.title.textContent = t('title');
  elements.subtitle.textContent = t('subtitle');
  elements.rssForm.label.textContent = t('rssForm.label');
  elements.rssForm.button.textContent = t('rssForm.button');
  elements.example.textContent = t('example');
};

const renderError = (elements, t, state) => {
  const { feedback } = elements;
  const { field } = elements.init.rssForm;

  field.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');

  if (state.error.unknownError) {
    feedback.textContent = t(state.error.unknownError);
    return;
  }

  if (state.error.exist) {
    feedback.textContent = t(state.error.exist);
    return;
  }
  feedback.textContent = t(state.error.url);
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

// const renderPosts = (postsListElement, postsState) => {
//   console.log(postsState);
//   postsState.forEach((post) => {
//     const { id, title, description, link } = post;

//     const postElement = document.createElement('li');
//     const titleElement = document.createElement('a');
//     const button = document.createElement('button');

//     postElement.classList.add(
//       'list-group-item', 
//       'd-flex', 
//       'justify-content-between', 
//       'align-items-start', 
//       'border-0', 
//       'border-end-0'
//     );
//     titleElement.classList.add('fw-bold');
//     titleElement.setAttribute('href', link);
//     titleElement.setAttribute('data-id', 'id')
//   });
// }

const renderRSS = (elements, t, state) => {
  const { posts, feeds } = elements;

  posts.title.textContent = t('posts');
  feeds.title.textContent = t('feeds');
  const postsListElement = posts.list;
  const feedsListElement = feeds.list;
  const lastFeed = state.feeds[state.feeds.length - 1];
  renderFeed(feedsListElement, lastFeed);
  // renderPosts(postsListElement, state.posts, lastFeed.id);
};

export default (elements, i18n, initialState) => {
  const { t } = i18n;
  renderText(elements.init, t);

  const watchedState = onChange(initialState, (path, value) => {  
    const { field } = elements.init.rssForm;

    if (Object.keys(watchedState.error).length !== 0) {
      field.removeAttribute('readonly');
      renderError(elements, t, watchedState);
    }

    if (watchedState.status === 'sending') {
      field.setAttribute('readonly', 'true');
    }

    if (watchedState.status === 'finished') {
      const { feedback } = elements;
      feedback.textContent = t('feedbacks.success');
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      field.removeAttribute('readonly');
      field.classList.remove('is-invalid');
      field.focus();
      field.value = '';
      renderRSS(elements, t, watchedState.lists);
    }
  });

  return watchedState;
};

