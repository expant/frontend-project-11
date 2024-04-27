export default () => ({
  init: {
    title: document.querySelector('h1'),
    subtitle: document.querySelector('p.lead'),
    rssForm: {
      form: document.querySelector('.rss-form'),
      field: document.querySelector('#url-input'),
      label: document.querySelector('.form-label'),
      button: document.querySelector('.rss-form .btn'),
    },
    example: document.querySelector('.example-muted'),
    modal: {
      readCompletely: document.querySelector('.modal-footer .btn-primary'),
      close: document.querySelector('.modal-footer .btn-secondary'),
    },
  },
  modal: {
    title: document.querySelector('.modal-title'),
    description: document.querySelector('.modal-body'),
    readCompletely: document.querySelector('.modal-footer .btn-primary'),
  },
  feedback: document.querySelector('.feedback'),
  posts: {
    parent: document.querySelector('.posts'),
    title: document.querySelector('.posts h2'),
    list: document.querySelector('.posts ul'),
  },
  feeds: {
    parent: document.querySelector('.feeds'),
    title: document.querySelector('.feeds h2'),
    list: document.querySelector('.feeds ul'),
  },
});
