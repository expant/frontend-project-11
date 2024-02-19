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

  if (state.error.exist) {
    feedback.textContent = t(state.error.exist);
    return;
  }
  feedback.textContent = t(state.error.url);
};

const renderFeed = (elements, t, state) => {
  const { feedback, posts, feeds } = elements;
  const { field } = elements.init.rssForm;

  posts.title.textContent = t('posts');
  feeds.title.textContent = t('feeds');
  feedback.textContent = t('feedbacks.success');
  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
  field.classList.remove('is-invalid');
  field.focus();
  field.value = '';
};

export default (elements, i18n, initialState) => {
  const { t } = i18n;
  renderText(elements.init, t);

  const watchedState = onChange(initialState, (path, value) => {
    if (watchedState.error === '') {
      renderFeed(elements, t, watchedState);
    }
  
    if (path === 'error') {
      renderError(elements, t, watchedState);
    }
  });

  return watchedState;
};

