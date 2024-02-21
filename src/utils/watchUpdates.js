const watchUpdates = (urls, lists) => {
  if (urls.length === 0) {
    setTimeout(watchUpdates, 5000);
  }

  const { posts } = lists;
  urls.forEach((url, i) => {
    const currentFlow = posts.filter((post) => post.feedId === i);
  });

  setTimeout(watchUpdates, 5000);
};

export default watchUpdates;