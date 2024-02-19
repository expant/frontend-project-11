import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';

yup.setLocale({
  string: {
    url: 'feedbacks.invalid',
  },
});

const schema = yup.object({
  url: yup.string().required().url(),
});

const getElements = () => ({
  init: {
    title: document.querySelector('h1'),
    subtitle: document.querySelector('p.lead'),
    rssForm: {
      form: document.querySelector('.rss-form'),
      field: document.querySelector('#url-input'),
      label: document.querySelector('.form-label'),
      button: document.querySelector('.btn'),
    },
    example: document.querySelector('.example-muted'),
  },
  feedback: document.querySelector('.feedback'),
  posts: {
    parent: document.querySelector('.posts'),
    title: document.querySelector('.posts h2'),
  },
  feeds: {
    parent: document.querySelector('.feeds'),
    title: document.querySelector('.feeds h2'),
  }
});

export default () => {
  const elements = getElements();
  // Model
  const initialState = {
    status: 'filling',
    enteredUrls: [],
    error: {},
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  // View
  const watchedState = watch(elements, i18n, initialState);

  // Controller
  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
  
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        if (watchedState.enteredUrls.includes(url)) {
          watchedState.error = { exist: 'feedbacks.exist' };
          watchedState.status = 'invalid';
          return;
        }

        watchedState.error = {};
        watchedState.status = 'valid';
        watchedState.enteredUrls.push(url);

        const resonse = axios.get(url)
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        const errorName = err.inner[0].path;
        const [errorKey] = err.errors;
        watchedState.status = 'invalid';
        watchedState.error = { [errorName]: errorKey };
      });
  });
};
