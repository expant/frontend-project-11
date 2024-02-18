import i18next from 'i18next';
import * as yup from 'yup';
import { keyBy } from 'lodash';
import watch from './view.js';
import ru from './locales/ru.js';

yup.setLocale({
  mixed: {
    url: () => ({ key: 'feedbacks.invalid' }),
  }
})

const schema = yup.object().shape({
  url: yup.string().trim().required().url(),
});

const validate = (field) => schema.validate(field, { abortEarly: false });

export default () => {
  const elements = {
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
  };

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
    resources: {
      ru,
    },
  });

  // View
  const watchedState = watch(elements, i18n, initialState);

  // Controller
  const { form } = elements.init.rssForm;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validate({ url: url.value })
      .then(() => {
        if (watchedState.enteredUrls.includes(url)) {
          watchedState.error = 'RSS already exists';
          watchedState.status = 'invalid';
          return;
        }

        watchedState.error = '';
        watchedState.status = 'valid';
        watchedState.enteredUrls.push(url);
      })
      .catch((err) => {
        const errorMessage = keyBy(err.inner, 'path').url.message;
        watchedState.status = 'invalid';
        watchedState.error = errorMessage;
      });
  });
};
