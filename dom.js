export const domElementCreate = (tag,attrs,parent)=>{
    let el=document.createElement(tag);
    Object.entries(attrs).forEach( ([key,value])=>{
        if (key==='dataset'){
            Object.entries(value).forEach( ([key,value])=>{
                el.dataset[key]=value;
            })
        } else {
            el[key]=value;
        }
    })
    if (parent){
        parent.appendChild(el);
    }
    return el;
}
export const replaceElement = (orignal, cloneDeep = true, cb) => {
    const el = orignal.cloneNode(cloneDeep);
    window.requestAnimationFrame(() => {
      orignal.replaceWith(el);
      if (cb) cb();
    });
    return el;
  };
   
  // on animFrame and removeChild
  export const clearElement = (el)=>{
      el.innerHTML="";
  }