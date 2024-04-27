const handleSeenPost = (event, watchedState) => {
  if (!event.target.dataset.id) {
    return;
  }
  const id = parseInt(event.target.dataset.id, 10);
  const seenPosts = [...watchedState.ui.seenPosts.all];
  if (seenPosts.includes(id)) {
    watchedState.ui.seenPosts = {
      last: id,
      all: seenPosts,
    };
    return;
  }
  watchedState.ui.seenPosts = {
    last: id,
    all: [...seenPosts, id],
  };
};

export default (elements, watchedState) => {
  const { list } = elements.posts;
  const postElements = list.querySelectorAll('li');
  postElements.forEach((el) => {
    el.addEventListener('click', (e) => handleSeenPost(e, watchedState));
  });
};

// export default handleModal;
