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
  setStarred(newStarred);
  return newStarred;
}
const clearStarred = () => {
  setStarred([]);
}

const test=()=>{
  const old=localStorage.getItem(storageItem);
clearStarred();
console.log(getStarred());
addStarred(12);
console.log(addStarred(32));
console.log(getStarred());
removeStarred(0);
console.log(getStarred());
console.log(removeStarred(12));
console.log(getStarred());
clearStarred();
console.log(getStarred());
localStorage.setItem(storageItem,old);
}

export default {
  getStarred,
  setStarred,
  addStarred,
  removeStarred,
  clearStarred,

  test
};
