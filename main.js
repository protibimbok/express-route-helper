import {readdirSync, lstatSync} from 'fs';
import { pathToFileURL } from 'url';
import {_Middlewares, setApp} from './holders.js';
import { resolveRouteOfType, cleanupAdds} from './add.js';

export { get, post, put, patch, del, all, use, middleware, route, via } from './router.js';


const cleanup = async ()=>{
    setApp(null);
    cleanupAdds();
    for(let i in _Middlewares){
        for(let type in _Middlewares[i]){
            delete _Middlewares[i][type];
        }
        delete _Middlewares[i];
    }
}

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
    for(let type of ['use', 'delete', 'put', 'patch', 'post', 'get', 'all']){
        await resolveRouteOfType(type);
    }
}


/**
 * 
 * @param {object} App 
 * @param {string} routes_dir 
 * @param {string} middlewares_dir 
 */

export const loadRoutes = async (app, routes_dir, middlewares_dir)=>{
    routes_dir = (routes_dir || 'routes');
    middlewares_dir = (middlewares_dir || 'middlewares');
    setApp(app);
    await importMiddlewares(middlewares_dir);
    await importRoutes(routes_dir);
    await resolveRoutes();
    cleanup();
}

export default loadRoutes;