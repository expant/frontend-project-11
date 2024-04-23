import onChange from 'on-change';
import STATUS from './utils/status.js';

const renderInitText = (elements, t) => {
  elements.title.textContent = t('title');
  elements.subtitle.textContent = t('subtitle');
  elements.rssForm.label.textContent = t('rssForm.label');
  elements.rssForm.button.textContent = t('rssForm.button');
  elements.example.textContent = t('example');
  elements.modal.readCompletely.textContent = t('modal.readCompletely');
  elements.modal.close.textContent = t('modal.close');
};

const renderFeed = (elements, t, watchedState) => {
  const { feeds } = elements;
  const feedsListElement = feeds.list;
  const lastFeed = watchedState.feeds[watchedState.feeds.length - 1];
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

const renderPosts = (args) => {
  const { elements, t, postsState, seenPosts } = args;
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

const changeClassOfSeenPost = (elements, id) => {
  const { list } = elements.posts;
  const element = list.querySelector(`li > a[data-id="${id}"]`);
  element.classList.remove('fw-bold');
  element.classList.add('fw-normal', 'link-secondary');
}

const renderModal = (elements, watchedState, id) => {
  const {
    title: modalElTitle,
    description: modalElDesc,
    readCompletely,
  } = elements.modal;
  const post = watchedState.posts.find((post) => post.id === id);
  const { title, description, link } = post;
  modalElTitle.textContent = title;
  modalElDesc.textContent = description;
  readCompletely.setAttribute('href', link);
};

const lockTheForm = (form, feedback) => {
  const { field, button } = form;
  field.classList.remove('is-invalid');
  // feedback.classList.remove('text-danger');
  button.setAttribute('disabled', '');
  field.setAttribute('readonly', '');
  feedback.textContent = '';
}

const unlockTheForm = (field, button) => {
  field.removeAttribute('readonly');
  button.removeAttribute('disabled');
  // feedback.classList.remove('text-danger');
}

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

const renderValid = (elements) => {
  const { feedback } = elements;
  const { field } = elements.init.rssForm;

  if (feedback.classList.contains('text-danger')) {
    feedback.classList.remove('text-danger');
  }
  field.classList.remove('is-invalid');    
  feedback.classList.add('text-success');
  feedback.textContent = ''; 
}

const handleSucessStatus = (form, feedback, t) => {
  const { field, button } = form;
  feedback.textContent = t('feedbacks.success');
  feedback.classList.add('text-success');
  unlockTheForm(field, button)
  field.focus();
  field.value = '';
};

const handleLoadingProcess = (elements, watchedState, value) => {
  const { rssForm } = elements.init;
  const { feedback } = elements;
  const { status } = value;

  if (status === STATUS.FAIL) {
    renderError(elements, t, watchedState.loadingProcess.error);
  }

  if (status === STATUS.SENDING) {
    lockTheForm(rssForm, feedback);
  }

  if (status === STATUS.SUCCESS) {
    console.log('ВСЁ ОК №3');
    handleSucessStatus(rssForm, feedback, t);
    const args = { 
      elements, 
      t, 
      postsState: watchedState.posts,
      seenPosts: watchedState.ui.seenPosts,
    };
    renderFeed(elements, t, watchedState);
    renderPosts(args);
  }

  // switch (status) {
  //   case STATUS.FAIL: {}
  //     renderError(elements, t, watchedState.loadingProcess.error);
  //     break;
  //   case STATUS.SENDING:
  //     lockTheForm(rssForm, feedback);
  //     break;
  //   case STATUS.SUCCESS: {
  //     handleSucessStatus(rssForm, feedback, t);
  //     const args = { 
  //       elements, 
  //       t, 
  //       postsState: watchedState.posts,
  //       seenPosts: watchedState.ui.seenPosts,
  //     };
  //     renderFeed(elements, t, watchedState);
  //     renderPosts(args);
  //     break;
  //   }
  //   default:
  //     throw new Error(`Unknown status: '${status}'!`);
  // }
}

export default (elements, i18n, initialState) => {
  const { t } = i18n;
  renderInitText(elements.init, t);

  const watchedState = onChange(initialState, (path, value) => {
    switch (path) {
      case 'rssForm': {
        if (!value.isValid) {
          renderError(elements, t, value.error);
          return;
        } 
        renderValid(elements);
        break;
        // if (!value.isValid) {
          
        // }
      }
      case 'ui.seenPosts': {
        const id = watchedState.ui.seenPosts.last;
        changeClassOfSeenPost(elements, id);
        renderModal(elements, watchedState, id);
        break;
      }
      case 'loadingProcess':
        console.log('Всё ок');
        handleLoadingProcess(elements, watchedState, value);
        break;
      case 'updatingProcess': {
        const { status } = value;

        if (status === STATUS.SUCCESS) {
          const args = { 
            elements,
            t, 
            postsState: watchedState.posts,
            seenPosts: watchedState.ui.seenPosts,
          };
          renderPosts(args);
        }
        break;
      }
      default:
        throw new Error(`Unknown path: '${path}'!`);
    }    
  });
  return watchedState;
};