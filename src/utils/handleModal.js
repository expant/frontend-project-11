export default (elements, watchedState) => {
  const { list } = elements.posts;
  const postElements = list.querySelectorAll('li');
  postElements.forEach((el) => el.addEventListener('click', (e) => {
    if (!e.target.dataset.id) {
      return;
    }
    const id = parseInt(e.target.dataset.id, 10);
    if (watchedState.ui.seenPosts.has(id)) {
      watchedState.ui.seenPosts.delete(id);
    }
    watchedState.ui.seenPosts.add(id);
  }));
};
