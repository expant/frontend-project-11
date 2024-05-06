export default (args) => {
  const {
    elements, t, postsState, seenPosts,
  } = args;
  const { posts } = elements;
  posts.title.textContent = t('posts');
  const postsListElement = posts.list;

  postsListElement.innerHTML = '';
  postsState.forEach((post) => {
    const { id, title, link } = post;
    const postElement = document.createElement('li');
    const titleElement = document.createElement('a');
    const button = document.createElement('button');

    postElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const titleElementClasses = seenPosts.all.includes(id)
      ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    titleElement.classList.add(...titleElementClasses);
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    titleElement.setAttribute('href', link);
    titleElement.setAttribute('data-id', id);
    titleElement.setAttribute('target', '_blank');
    titleElement.setAttribute('rel', 'noopener noreferrer');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-bs-toggle', 'modal');
    titleElement.textContent = title;
    button.textContent = 'Просмотр';
    postElement.append(titleElement);
    postElement.append(button);
    postsListElement.append(postElement);
  });
};
