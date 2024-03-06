const getElements = (doc) => ({
  feedElement: {
    title: doc.querySelector('channel > title'),
    description: doc.querySelector('channel > description'),
  },
  postsElement: doc.querySelectorAll('item'),
});

export default (string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(string, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    return {};
  }

  const { feedElement, postsElement } = getElements(doc);
  const feed = {
    title: feedElement.title.textContent,
    description: feedElement.description.textContent,
  };

  const posts = Array.from(postsElement).map((postElement) => {
    const titleElement = postElement.querySelector('title');
    const descriptionElement = postElement.querySelector('description');
    const linkElement = postElement.querySelector('link');
    const title = titleElement.textContent;
    const description = descriptionElement.textContent;
    const link = linkElement.textContent;
    return { title, description, link, read: false };
  });
  return { feed, posts };
};