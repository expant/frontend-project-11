const watchUpdates = (state) => {
  if (state.urls.length === 0) {
    console.log(state.urls.length);
    setTimeout((state) => watchUpdates(state), 5000);
  }

  if (state.urls.length !== 0) {
    state.urls.forEach((url, i) => {
      const currentFlow = state.lists.posts.filter((post) => post.feedId === i);
      console.log(currentFlow);
    });
  }

  // setTimeout((, 5000);
};

export default watchUpdates;