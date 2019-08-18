const domElementCreate = (tag,attrs,parent)=>{
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

export default domElementCreate;