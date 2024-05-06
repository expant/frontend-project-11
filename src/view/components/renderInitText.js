export default (elements, t) => {
  elements.title.textContent = t('title');
  elements.subtitle.textContent = t('subtitle');
  elements.rssForm.label.textContent = t('rssForm.label');
  elements.rssForm.button.textContent = t('rssForm.button');
  elements.example.textContent = t('example');
  elements.modal.readCompletely.textContent = t('modal.readCompletely');
  elements.modal.close.textContent = t('modal.close');
};
