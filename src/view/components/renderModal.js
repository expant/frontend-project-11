export default (elements, state, id) => {
  const {
    title: modalElTitle,
    description: modalElDesc,
    readCompletely,
  } = elements.modal;
  const post = state.posts.find((item) => item.id === id);
  const { title, description, link } = post;
  modalElTitle.textContent = title;
  modalElDesc.textContent = description;
  readCompletely.setAttribute('href', link);
};
