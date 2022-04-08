import { Router } from 'express';
import _Routes from './router.js';
import {app, _Middlewares} from './holders.js';

const getMiddleware = (type, path, middleware)=>{
    if(typeof middleware === 'string' && typeof _Middlewares[middleware] === 'function'){
        middleware = _Middlewares[middleware];
    }else if(typeof middleware !== 'function'){
        console.error('Invalid middleware: ', middleware);
        return false;
    }
    middleware[type] = middleware[type] || {};
    if(typeof middleware[type][path] !== 'undefined'){
        console.log('Elliminated duplication of middleware: ');
        console.log('  '+type.toUpperCase()+"  "+path+"\n  Name: "+(middleware.name || '<anonymus>'));
        return false;
    }
    middleware[type][path] = true;
    return middleware;
}

const addRoute = (type, path, route)=>{
    route.middlewares.forEach(middleware=>{
        middleware = getMiddleware(type, path, middleware);
        if(middleware){
            app[type](path, middleware);
        }
    });
    app[type](path, route.handler);
}

const addRegexRoute = (type, regex, router)=>{
    regex.middlewares.forEach(middleware=>{
        middleware = getMiddleware(type, regex.path, middleware);
        if(middleware){
            router[type](regex.path, middleware);
        }
    });
    router[type](regex.path, regex.handler);
}

export const resolveRouteOfType = async (type) => {
    const Routes = _Routes[type];
    Routes.indexes.sort().reverse();
    for(let i of Routes.indexes){
        for(let path in Routes[i]){
            const route = Routes[i][path];
            if(typeof route.handler === 'function'){
                addRoute(type, path, route);
            }
            if(typeof route.regex !== 'undefined'){
                const router = Router();
                for(let regex of route.regex){
                    addRegexRoute(type, regex, router);
                }
                app.use(path, router);
            }
        }
        if(typeof Routes[i].dynamics !== 'undefined'){
            Routes[i].dynamics.indexes.sort().reverse();
            for(let j of Routes[i].dynamics.indexes){
                Routes[i].dynamics[j].forEach(route=>{
                    addRoute(type, route.path, route);
                });
            }
        }
    }
    
    if(typeof Routes.home !== 'undefined'){
        addRoute(type, '/', Routes.home);
    }
}

export const cleanupAdds = async ()=>{
    for (let i in _Routes){
        for(let j in _Routes[i]){
            delete _Routes[i][j];
        }
        delete _Routes[i];
    }
}