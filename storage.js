const storageItem = "starredStops";

const getStarred = () => JSON.parse(localStorage.getItem(storageItem));
const setStarred = arr => { localStorage.setItem(storageItem,JSON.stringify(arr))};
const addStarred = starred => {
  const newStarred=[...getStarred(), starred];
  setStarred(newStarred);
  return newStarred;
};
const removeStarred = id => {
  const newStarred = getStarred().filter(el=>el!=id);
  setStarred(newStarred)
}
const clearStarred = () => {
  setStarred([]);
}

export default {
  getStarred,
  setStarred,
  addStarred,
  removeStarred,
  clearStarred
};
