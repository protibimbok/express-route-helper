const _Routes = {};
['get', 'post', 'put', 'delete', 'patch', 'all', 'use'].forEach((type)=>{
    _Routes[type] = {indexes: [], dynamics:{indexes: []}};
});

export default _Routes;

const storeObj = (obj, type, path, handler)=>{
    const rpath  = ('/'+obj._path).replace(/\/{2,}/g, '/');
    const count = rpath.match(/\//g).length + 1;

    if(typeof _Routes[type][count] === 'undefined'){
        _Routes[type][count] = {};
        _Routes[type].indexes.push(count);
    }
    _Routes[type][count][rpath] = _Routes[type][count][rpath] || {};
    if(typeof _Routes[type][count][rpath].regex === 'undefined'){
        _Routes[type][count][rpath].regex = [];
    }
    _Routes[type][count][rpath].regex.push({
        handler,
        middlewares: obj._middlewares,
        path
    });
}



const storeDyn = (obj, type, path, handler)=>{
    const fo = path.search(/[^a-zA-Z0-9\-\/_]/);
    if(fo == -1){
        return false;
    }
    const sub = path.substring(0, fo);
    const count = sub.match(/\//g).length;
    const len = fo - sub.lastIndexOf('/');
    if(typeof _Routes[type][count] === 'undefined'){
        _Routes[type][count] = {
            indexes: []
        };
        _Routes[type].indexes.push(count);
    }
    _Routes[type][count].dynamics = _Routes[type][count].dynamics || {
        indexes: []
    };
    if(typeof _Routes[type][count].dynamics[len] === 'undefined'){
        _Routes[type][count].dynamics[len] = [];
        _Routes[type][count].dynamics.indexes.push(len);
    }
   
    _Routes[type][count].dynamics[len].push({
        path,
        handler,
        middlewares: obj._middlewares
    });
    return true;
}

const store = (obj, type, path, handler)=>{
    if(typeof path === 'object' && typeof handler === 'function' || obj._objPath.length > 1){
        storeObj(obj, type, path, handler);
        return;
    }
    if(typeof path === 'function'){
        handler = path;
        path = '';
    }

    path = ('/'+obj._path + '/' + path).replace(/\/{2,}/g, '/');

    if(storeDyn(obj, type, path, handler)){
        return;
    }
    
    if(path === '/'){
        _Routes[type].home = {
            handler,
            middlewares: obj._middlewares
        }
        return;
    }
    path = path.replace(/([\/]+)$/, '');
    const count = path.match(/\//g).length;
    if(typeof _Routes[type][count] === 'undefined'){
        _Routes[type][count] = {};
        _Routes[type].indexes.push(count);
    }

    _Routes[type][count][path] = _Routes[type][count][path] || {};
    _Routes[type][count][path].handler = handler;
    _Routes[type][count][path].middlewares = obj._middlewares;
}


const nestedGroup = (self, obj, fn)=>{
    obj._path+='/'+self._path;
    const oldMids = obj._middlewares;
    obj._middlewares = [...self._middlewares, ...obj._middlewares];
    fn();
    obj._path = obj._path.replace(new RegExp('/'+self._path+'$'), '');
    obj._middlewares = oldMids;
}


let obj;


const preStore = (self, type, path, handler)=>{
    if(obj){
        nestedGroup(self, obj, ()=>store(obj, type, path, handler));
    }else{
        store(self, type, path, handler);
    }
}

class Router{
    constructor(){
        this._path = '';
        this._objPath = [];
        this._middlewares = [];
    }


    /**
     * 
     * @param {Function[]|Function} middlewares 
     * @returns 
     */

    middleware(middlewares){
        if(typeof middlewares === 'function' || typeof middlewares === 'string'){
            this._middlewares.push(middlewares);
        }else if (Array.isArray(middlewares)){
            middlewares.forEach(middleware=>{
                this._middlewares.push(middleware);
            });
        }
        return this;
    }

    /**
     * 
     * @param {Function[]|Function} vias 
     * @returns 
     */

    via(vias){
        return this.middleware(vias);
    }

    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */

    get(path, handler){
        preStore(this, 'get', path, handler);
        return this;
    }
    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    post(path, handler){
        preStore(this, 'post', path, handler);
        return this;
    }

    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    put(path, handler){
        preStore(this, 'put', path, handler);
        return this;
    }
    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    patch(path, handler){
        preStore(this, 'patch', path, handler);
        return this;
    }
    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    delete(path, handler){
        preStore(this, 'delete', path, handler);
        return this;
    }
    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    all(path, handler){
        preStore(this, 'all', path, handler);
        return this;
    }
    
    /**
     * 
     * @param {string} path 
     * @param {Function} handler 
     * @returns 
     */
    use(path, handler){
        preStore(this, 'use', path, handler);
        return this;
    }

    /**
     * 
     * @param {Function} fn 
     * @returns 
     */
    group(fn){
        if(obj){
            nestedGroup(this, obj, fn);
        }else{
            obj = this;
            fn();
            obj = null;
        }
        return this;
    }

    /**
     * 
     * @param {string} path 
     * @returns 
     */
    route(path){
        if(typeof path === 'string'){
            this._path = path;
        }else{
            //this._objPath.push(path);
            throw new Error('Grouping with object path is not supported yet!');
        }
        return this;
    }

}

/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const get = (path, handler)=>{
    if(!obj) return (new Router()).get(path, handler);
    store(obj, 'get', path, handler);
}
/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const post = (path, handler)=>{
    if(!obj) return (new Router()).post(path, handler);
    store(obj, 'post', path, handler);
}
/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const put = (path, handler)=>{
    if(!obj) return (new Router()).put(path, handler);
    store(obj, 'put', path, handler);
}


/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const patch = (path, handler)=>{
    if(!obj) return (new Router()).patch(path, handler);
    store(obj, 'patch', path, handler);
}


/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const del = (path, handler)=>{
    if(!obj) return (new Router()).delete(path, handler);
    store(obj, 'delete', path, handler);
}


/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const all = (path, handler)=>{
    if(!obj) return (new Router()).all(path, handler);
    store(obj, 'all', path, handler);
}


/**
 * 
 * @param {string} path 
 * @param {Function} callback 
 * @returns 
 */

export const use = (path, handler)=>{
    if(!obj) return (new Router()).use(path, handler);
    store(obj, 'use', path, handler);
}

/**
 * 
 * @param {string} path 
 * @returns 
 */

export const route = (path)=>{
    return (new Router()).route(path);
}


/**
 * 
 * @param {Function[]|Function} middlewares 
 * @returns 
 */

export const middleware = (middlewares)=>{
    return (new Router()).middleware(middlewares);
}


/**
 * 
 * @param {Function[]|Function} middlewares 
 * @returns 
 */


export const via = (vias)=>{
    return (new Router()).via(vias);
}