export default (elements, t, state) => {
  const { feeds } = elements;
  const feedsListElement = feeds.list;
  const lastFeed = state.feeds[state.feeds.length - 1];
  const { title, description } = lastFeed;
  const feedElement = document.createElement('li');
  const titleElement = document.createElement('h3');
  const descriptionElement = document.createElement('p');

  feeds.title.textContent = t('feeds');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
  titleElement.classList.add('h6', 'm-0');
  descriptionElement.classList.add('m-0', 'small', 'text-black-50');
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  feedElement.append(titleElement);
  feedElement.append(descriptionElement);
  feedsListElement.prepend(feedElement);
};
