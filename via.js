import {_Middlewares} from './holders.js';
export const _ViaPaths = {};


const viaCallback = (req, res, via, idx, next)=>{
    if(idx === via.length){
        return next;
    }
    return (a, b)=>{
        via[idx](req, res, viaCallback(a, b, via, idx+1, next));
    }
}

export const viaFn = (req, res, next)=>{
    const list = _ViaPaths[req.method];
    if(!list){
        return next();
    }
    const via = list[req.path];
    if(!via || !via.length){
        return next();
    }
    via[0](req, res, viaCallback(req, res, via, 1, next));
}

export const addVias = (type, path, vias)=>{
    type = type.toUpperCase();
    _ViaPaths[type][path] = [];
    vias.forEach(via=>{
        if(typeof via === 'function'){
            _ViaPaths[type][path].push(via);
        }else if(typeof via === 'string' && typeof _Middlewares[via] === 'function'){
            _ViaPaths[type][path].push(_Middlewares[via]);
        }else{
            console.error('Invalid via function: ', via);
        }
    });
}
