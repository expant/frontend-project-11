const unlockTheForm = (field, button) => {
  field.removeAttribute('readonly');
  button.removeAttribute('disabled');
};

const lockTheForm = (form, feedback) => {
  const { field, button } = form;
  field.classList.remove('is-invalid');
  button.setAttribute('disabled', '');
  field.setAttribute('readonly', '');
  feedback.textContent = '';
};

const handleSucessStatus = (form, feedback, t) => {
  const { field, button } = form;
  feedback.textContent = t('feedbacks.success');
  feedback.classList.add('text-success');
  unlockTheForm(field, button);
  field.focus();
  field.value = '';
};

const renderValid = (elements) => {
  const { feedback } = elements;
  const { field } = elements.init.rssForm;

  if (feedback.classList.contains('text-danger')) {
    feedback.classList.remove('text-danger');
  }
  field.classList.remove('is-invalid');
  feedback.classList.add('text-success');
  feedback.textContent = '';
};

const renderError = (elements, t, error) => {
  const { feedback } = elements;
  const { field, button } = elements.init.rssForm;

  unlockTheForm(field, button);

  if (feedback.classList.contains('text-success')) {
    feedback.classList.remove('text-success');
  }
  field.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = t(error);
};

export {
  handleSucessStatus,
  renderValid,
  renderError,
  lockTheForm,
};
