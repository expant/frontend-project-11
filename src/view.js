import onChange from 'on-change';

const renderText = (elements, i18n) => {
  const entries = Object.entries(elements);
  entries.forEach(([name, element]) => {
    if (name === 'rssForm') {
      element.label.textContent = i18n.t('rssForm.label');
      element.button.textContent = i18n.t('rssForm.button');
      return;
    }
    element.textContent = i18n.t(name);
  });
};

const renderError = (elements, initialState) => {
  const { urlField, feedback } = elements;

  urlField.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');

  if (initialState.error === 'RSS already exists') {
    feedback.textContent = 'RSS уже существует';
    return;
  }
  feedback.textContent = 'Ссылка должна быть валидным URL';
};

const renderFeed = (elements, initialState) => {
  const { urlField, feedback } = elements;

  feedback.textContent = 'RSS успешно загружен';
  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
  urlField.classList.remove('is-invalid');
  urlField.focus();
  urlField.value = '';
};

export default (elements, i18n, initialState) => {
  renderText(elements.init, i18n);

  const watchedState = onChange(initialState, (path, value) => {
    if (initialState.error === '') {
      renderFeed(elements, initialState);
    }
  
    if (path === 'error') {
      renderError(elements, initialState);
    }
  });

  return watchedState;
};

