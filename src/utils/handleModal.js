const handleSeenPost = (event, watchedState) => {
  const id = event.target.dataset.id;
  if (!id ) {
    return;
  }

  const seenPosts = [...watchedState.ui.seenPosts];
  if (seenPosts.includes(id)) {
    watchedState.ui.seenPosts = seenPosts;
    return;
  }
  watchedState.ui.seenPosts.push(id);
}; 

const handleModal = (elements, watchedState) => {
  const { list } = elements.posts;
  const postElements = list.querySelectorAll('li');
  postElements.forEach((el) => {
    el.addEventListener('click', (e) => handleSeenPost(e, watchedState));
  });
};

export default handleModal;