import {readdirSync, lstatSync} from 'fs';
import _Routes from './router.js';
import { Router } from 'express';
import { pathToFileURL } from 'url';
import {_Middlewares} from './holders.js';
import {viaFn, addVias, _ViaPaths} from './via.js';

export { get, post, put, patch, del, all, use, middleware, route, via } from './router.js';


let app, _viaAdded = false;

const importRoutes = async (dirPath)=>{
    const entries = readdirSync(dirPath);
    for (let entry of entries){
        if(!entry.endsWith('.js') || entry.endsWith('.skip.js')){
            continue;
        }
        if(!lstatSync(dirPath+'/'+entry).isDirectory()){
            await import(pathToFileURL(dirPath+'/'+entry));
        }
    }
}
const importMiddlewares = async (dirPath)=>{
    const entries = readdirSync(dirPath);
    for (let entry of entries){
        if(!entry.endsWith('.js') || entry.endsWith('.skip.js')){
            continue;
        }
        if(!lstatSync(dirPath+'/'+entry).isDirectory()){
            const middlewares = await import(pathToFileURL(dirPath+'/'+entry));
            for( let name in middlewares){
                if(typeof _Middlewares[name] !== 'undefined'){
                    console.error('Duplication of middleware: '+name);
                }else{
                    _Middlewares[name] = middlewares[name];
                }
            }
        }
    }
}

const resolveRoutes = async ()=>{
    for(let type of ['delete', 'put', 'patch', 'post', 'get', 'use']){
        _ViaPaths[type.toUpperCase()] = {};
        await resolveRouteOfType(type);
    }
}

const addRoute = (type, path, route)=>{
    route.middlewares.forEach(middleware=>{
        if(typeof middleware === 'function'){
            app[type](path, middleware);
        }else if(typeof middleware === 'string' && typeof _Middlewares[middleware] === 'function'){
            app[type](path, _Middlewares[middleware]);
        }else{
            console.error('Invalid middleware: ', middleware);
        }
    });
    
    app[type](path, route.handler);
}

const addRegexRoute = (type, regex, router)=>{
    regex.middlewares.forEach(middleware=>{
        if(typeof middleware === 'function'){
            router[type](regex.path, middleware);
        }else if(typeof middleware === 'string' && typeof _Middlewares[middleware] === 'function'){
            router[type](regex.path, _Middlewares[middleware]);
        }else{
            console.error('Invalid middleware: ', middleware);
        }
    });
    router[type](regex.path, regex.handler);
}

const resolveRouteOfType = async (type) => {
    const Routes = _Routes[type];
    Routes.indexes.sort().reverse();
    for(let i of Routes.indexes){
        for(let path in Routes[i]){
            const route = Routes[i][path];
            if(typeof route.handler === 'function'){
                if(route.vias.length > 0){
                    if(!_viaAdded){
                        app.use(viaFn);
                        _viaAdded = true;
                    }
                    addVias(type, path, route.vias);
                }
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
        
        if(Routes.home.vias.length > 0){
            addVias(type, '/', Routes.home.vias);
        }
        addRoute(type, '/', Routes.home);
    }
}
/**
 * 
 * @param {object} App 
 * @param {string} routes_dir 
 * @param {string} middlewares_dir 
 */

const loadRoutes = async (App, routes_dir, middlewares_dir)=>{
    routes_dir = (routes_dir || 'routes');
    middlewares_dir = (middlewares_dir || 'middlewares');
    app = App;
    await importMiddlewares(middlewares_dir);
    await importRoutes(routes_dir);
    await resolveRoutes();
}

export default loadRoutes;