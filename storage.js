const storageItem = "starredStops";

const getStarred = () => JSON.parse(localStorage.getItem(storageItem))||[];
const setStarred = arr => { localStorage.setItem(storageItem,JSON.stringify(arr))};
const addStarred = starred => {
  const newStarred=[...getStarred(), starred];
  setStarred(newStarred);
  return newStarred;
};
const removeStarred = starred => {
  const newStarred = getStarred().filter(el=>el.id!=starred.id);
  setStarred(newStarred);
  return newStarred;
}
const clearStarred = () => {
  setStarred([]);
}
const isStarred = starred => {
  return Boolean(getStarred().find(el=>el.id===starred.id))
}
const toggleStarred = starred => {
  return isStarred(starred) ? removeStarred(starred) : addStarred(starred);
}

const test=()=>{
  const e1={id:"23232","name":"Jan"}
  const e2={id:"111","name":"Lucas"}

  const old=localStorage.getItem(storageItem);
clearStarred();
console.log(getStarred());
addStarred(e2);
console.log(addStarred(e1));
console.log(getStarred());
removeStarred(e2);
console.log(getStarred());
console.log(isStarred(e1));
console.log(removeStarred(e1));
console.log(isStarred(e1));
console.log(toggleStarred(e1))
console.log(isStarred(e1));
console.log(toggleStarred(e1))
console.log(isStarred(e1));
console.log(getStarred());
clearStarred();
console.log(getStarred());
localStorage.setItem(storageItem,old);
}

export default {
  getStarred,
  setStarred,
  isStarred,
  toggleStarred,
  addStarred,
  removeStarred,
  clearStarred,

  test
};
