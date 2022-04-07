
# express-route-helper

An express route helper. This package allows writing and managing
express routes and middlewares easily. And it provides some additional
features.

## Installation

Install `express-route-helper` with npm

```bash
  npm install express-route-helper
```
    
Install `express-route-helper` with yarn

```bash
  yarn add express-route-helper
```
## Usage/Examples

Your projects directory tree
- main.js
- routes/
    - main.js
    - products.js
    - somefile.skip.js
- middlewares/
    - auth.js
    - something.js

And your main.js file looks like:
```javascript
import express from 'express';
import loadRoutes from 'express-route-helper';

const app = express();

/**
 * loadRoutes(app, routes_dir='routes', middlewares_dir='middlewares');
 * Pass the routes and/or middlewares directory path if you prefer different one
 */

await loadRoutes(app);

app.listen(7223, ()=>{
    console.log('http://localhost:7223');
});

```
Then export the middlewares from the files of middlewares directory like this
```javascript
export const log = (req, res, next) => {
    console.log('Logged');
    next();
}

export const log2 = (req, res, next) => {
    console.log('Logged 2');
    next();
}
```

Then write your routes file like this:

```javascript
import {get, post, put, patch, del, use, middleware, route, via} from 'express-route-helper';

get('/nolog', (req, res)=>{
    /**
     * This should not be logged but express calls parent middlewares automatically!
     * So, the middlewares registered with via will not be called but the one registered
     * with middleware in the parent (/) will be called
     */
    res.send('No log..');
});

route('/').via('log').group(()=>{
    get('/', (req, res)=>{
        res.send('Alhamdulillah! Home is fine.');
    });
    get('/:name', (req, res)=>{
        res.send('Hello, '+req.params.name+'!');
    });
    get('/string', (req, res)=>{
        /**
         * Normally order matters in which they are written
         * In this case you'd never get this function called
         * But with express-route-helper it is sorted automatically so that
         * everything works as expected
         */
        res.send('String path!');
    });
    via('log2').group(()=>{
        get('/log2', (req, res)=>{
            res.send('Nested example!');
        });
    });
});

```
## Features

#### 1. Clean & Elegant syntax

Instead of importing different route files and managing them, it automatically does that for you.
All you have to do is import and that's it.

```javascript

import {get} from 'express-route-helper';

get('/path', (req, res)=>{
    res.send('How is that?');
});

```
This pattern is inspired from php Laravel. Just like that, you can group your routes too
```javascript

import {get, post, route} from 'express-route-helper';

get('/path', (req, res)=>{
    res.send('How is that?');
});

route('/chat').middleware([]).group(()=>{
    get('/', (req, res)=>{
        //GET /chat
    })
    post('/new', (req, res)=>{
        //GET /chat/new
    })
});

```

#### 2. Automatic imports

All of the routes and middlewares are imported automatically.
**__If you want a file to not be imported, add `.skip.js` in the end if the filename.__**

```javascript
// middlewares/auth.js
export const checkLogin = (req, res, next)=>{
    //Do your logic
    next();
}
```
Now in your router file, you don't even need to import these manually

```javascript
//routes/user.js
import {get} from 'express-route-helper';

get('/profile', (req, res)=>{
    //Your stuff
}).middleware('checkLogin');

/**
 * Accepts string, function or array of both
 */

```
__Note: Registering a middleware twice may result in getting called twice for each request__

#### 3. `via` - New way of middlewares

Express handles middlewares in a way that, all of the middlewares registered for `/chat`
will get called for every request that starts with `/chat/` ( i.e. `/chat/add`, `/chat/get`).
With `via`, I've tried to fix this problem. Currently it only works for plain routes only.
Dynamic `/path/:param` or `/^regex/` is not supported yet.

```javascript

import {get, post, route} from 'express-route-helper';

get('/path', (req, res)=>{
    res.send('This is parent');
}).via(['fn1', 'fn2']);

get('/path/:param', (req, res)=>{
    res.send('This is parent');
});

```

For the previous example, the middlewares `fn1` and `fn2` will only get called for `/path`
route.
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- [Sakibur Rahman Khan (Saad)](https://www.github.com/protibimbok)


## Feedback

If you have any feedback, please reach out to us at [Github](https://github.com/protibimbok/express-route-helper)

