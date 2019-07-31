const storageItem = "collections";

const getCollections = () => JSON.parse(localStorage.getItem(storageItem));
const addCollection = collection => {
  localStorage.setItem(storageItem, [...getCollections(), collection]);
};

const addStopToCollections = stop => {
  addCollection({ stops: [stop], single: true });
};

export default {
  getCollections,
  addCollection,
  addStopToCollections,
};
