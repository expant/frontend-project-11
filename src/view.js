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

export default (elements, initialState) => (path, value) => {
  if (initialState.error === '') {
    renderFeed(elements, initialState);
  }

  if (path === 'error') {
    renderError(elements, initialState);
  }
};
