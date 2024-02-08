import * as yup from 'yup';
import { keyBy } from 'lodash';
import render from './view.js';
import onChange from 'on-change';

const schema = yup.object().shape({
  url: yup
    .string()
    .trim()
    .required('Link must be a valid URL')
    .url(),
});

const validate = (field) => schema.validate(field, { abortEarly: false });

export default () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlField: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  // Model
  const initialState = {
    status: 'filling',
    enteredUrls: [],
    error: '',
  };

  // View
  const state = onChange(initialState, render(elements, initialState));

  // Controller
  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.urlField.value;
    
    validate({ url })
      .then(() => {
        if (state.enteredUrls.includes(url)) {
          state.error = 'RSS already exists';
          state.status = 'invalid';
          return;
        }

        state.error = '';
        state.status = 'valid';
        state.enteredUrls.push(url);
      })
      .catch((err) => {
        const errorMessage = keyBy(err.inner, 'path').url.message;
        state.status = 'invalid'
        state.error = errorMessage;
      });
  });
};
