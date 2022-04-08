import {get, route, via} from '../../main.js';

get('/', (req, res)=>{
    res.send('home');
}).middleware('log');

route('/app').via(['log', 'log2']).group(()=>{
    via('log').get('/', (req, res)=>{
        res.send('App');
    });
});