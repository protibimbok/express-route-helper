import {get, route, via} from '../../main.js';

get('/nolog', (req, res)=>{
    res.send('This should not be logged but express calls parent middlewares automatically!');
});

route('/').via('log').group(()=>{
    get('/', (req, res)=>{
        res.send('Alhamdulillah! Home is fine.');
    });
    get('/:name', (req, res)=>{
        res.send('Hello, '+req.params.name+'!');
    });
    get('/string', (req, res)=>{
        res.send('Normally it should be overriden by /:name, But here we are!');
    });
    via('log2').group(()=>{
        get('/log2', (req, res)=>{
            res.send('Nested example!');
        });
    });
});

route('/api').via('log').group(()=>{
    get('/', (req, res)=>{
        res.send('API is fine.');
    });
    get('/:name', (req, res)=>{
        res.send('Hello, '+req.params.name+'!');
    });
    get('/string', (req, res)=>{
        res.send('Normally it should be overriden by /:name, But here we are!');
    });
    via('log2').group(()=>{
        get('/log2', (req, res)=>{
            res.send('Nested example!');
        });
    });
});