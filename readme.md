# express-route-helper

An express route helper. This package allows writing and managing
express routes and middlewares easily. And it provides some additional
features. And __all of this without adding any request overhead.__
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

Let the directory tree of your project be:

```bash
|--- app.js
|--- routes/
|    |--- home.js
|    |--- chat.js
|    |--- somefile.skip.js
|
|--- middlewares/
|    |--- auth.js
|    |--- role.js
|    |--- chat.js
|    | somefile.skip.js
```
**__Any file that ends with `.skip.js` will not be imported automatically.__**

And your app.js file looks like:
```javascript
import express from 'express';
import loadRoutes from 'express-route-helper';

const app = express();

await loadRoutes(app);

app.listen(3000, ()=>{
    console.log('http://localhost:3000');
});

```
Then export middlewares from files of middlewares folder like this
```javascript
export const log = (req, res, next) => {
    console.log('Logged');
    next();
}

export const log2 = (req, res, next) => {
    console.log('Logged 2');
    next();
}

export const log3 = (req, res, next) => {
    console.log('Logged 3');
    next();
}
```

Then write your routes file like this:

```javascript
import {get, post, put, patch, del, all, use, middleware, route, via} from 'express-route-helper';

get('/nolog', (req, res)=>{
    res.send('No log..');
});

route('/').via('log').middleware(['log3']).group(()=>{
    get('/', (req, res)=>{
        res.send('Alhamdulillah! Home is fine.');
    });
    get('/:name', (req, res)=>{
        res.send('Hello, '+req.params.name+'!');
    });
    get('/string', (req, res)=>{
        res.send('String path!');
    });
    via('log2').group(()=>{
        get('/log2', (req, res)=>{
            res.send('Nested example!');
        });
    });
});

```
## Function Reference

#### loadRoutes(app, routes_dir, middlewares_dir)

```javascript
import express from 'express';
import loadRoutes from `express-route-helper`;
const app = express();
await loadRoutes(app);
app.listen(3000);
```

**Note:** *This function is exported as default.*

| Parameter         | Type     |  Default    | Description                |
| :---------------- | :------- | :---------- | :------------------------- |
| `app`             | `object` | undefined   | **Required**. Instance of `express` |
| `routes_dir`      | `string` | routes      | Path of the directory that contains the route files. |
| `middlewares_dir` | `string` | middlewares | Path of the directory that contains the middleware files. |


#### http methods

- get(path, handler);
- post(path, handler);
- put(path, handler);
- patch(path, handler);
- del(path, handler);
- all(path, handler);
- use(path, handler);


| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `path` | `string` | **Required**. Route path |
| `handler` | `Function` | **Required**. handler for the route. |

**Note:** *`del` is used instead of `delete`*

#### middleware(functions)

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `functions` | `string`, `Function` or `Array` of both | **Required**. The Function or Functions that will be used as middlewares. |

#### via(functions)

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `functions` | `string`, `Function` or `Array` of both | **Required**. The Function or Functions that will be used as via. |

#### route(path)

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `path` | `string` | **Required**. Route path |


**All of the functions can be chained together including `group`**
## Features

#### 1. Clean & Elegant syntax
This syntax is highly inspired from `Laravel`

```javascript

import {get} from 'express-route-helper';

get('/path', (req, res)=>{
    res.send('How is that?');
});

```

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

#### 2. No need to import middlewares manually

Normally, if you want to keep your middlewares and routes in separate files,
you must import them in order to use. But not anymore.

```javascript
// middlewares/log.js

export const log = (req, res, next) =>{
    console.log('New request!');
    next();
}
```
Now in routes file you can just specify the name like this:
```javascript
// routes/main.js

import {get} from 'express-route-helper';

get('/', (req, res)=>{
    //Your code
}).middleware(['log', 'some_other_middleware']);
```

#### 3. No duplication of middlewares
This might seem illogical, like why would anyone add the same middleware twice.
Let's just use this for demo purpose.
```javascript
import express from 'express';

const app = express();
const log = (req, res, next)=>{
    console.log('Incoming request!');
    next();
};

app.get('/', log);


app.get('/about', log);

app.listen(3000);

```
In this case visiting `/about` will print `Incoming request!` twice in the console.
But in the following way, this just prints once.
```javascript
import {get} from 'express-route-helper';

const log = (req, res, next)=>{
    console.log('Incoming request!');
    next();
};

get('/', (req, res)=>{
    //Stuff
}).middleware(log);


get('/about', (req, res)=>{
    //Stuff
}).middleware(log);;


```

#### 4. Automatic sorting of routes

Let's consider the following code:

```javascript
import express from 'express';

const app = express();

app.get('/:id', (req, res)=>{
    res.send('Hello from dynamic id page!');
});


app.get('/about', (req, res)=>{
    res.send('Hello from about page!');
});

app.listen(3000);

```
In this example, you can never access the `/about` page because the `/:id` route
is described before the `/about` route. Imagine managing this order in dozens of files.

But this problem can be solved using `express-route-helper` like this:

```javascript
// routes/main.js

import {get} from 'express-route-helper';

get('/:id', (req, res)=>{
    res.send('Hello from dynamic id page!');
});

get('/about', (req, res)=>{
    res.send('Hello from about page!');
});

```
Internally this is sorted in a way that all of the routes can be accessed!


#### 5. `via` - New way of middlewares

Same as `middleware`. Included as a shorthand.

```javascript

import {get} from 'express-route-helper';

get('/path', (req, res)=>{
    res.send('This is parent');
}).via(['fn1', 'fn2']);

get('/path/:param', (req, res)=>{
    res.send('This is parent');
});

```


#### 6. Route grouping

Routes that shares common properties can be grouped.

```javascript

import {get, post, route} from 'express-route-helper';

get('/', (req, res)=>{
    res.send('Home! sweet home...');
});

route('/chat').middleware(['auth', 'some_other']).group(()=>{

    get('/', (req, res)=>{
        //Stuff
    });

    get('/info', (req, res)=>{
        //Stuff
    });

    post('/send', (req, res)=>{
        //Stuff
    });

});

```

This above code is equevalent to:

```javascript

import {get, post, route} from 'express-route-helper';

get('/', (req, res)=>{
    res.send('Home! sweet home...');
});

get('/chat/', (req, res)=>{
    //Stuff
}).middleware(['auth', 'some_other']);

get('/chat/info', (req, res)=>{
    //Stuff
}).middleware(['auth', 'some_other']);

post('/chat/send', (req, res)=>{
    //Stuff
}).middleware(['auth', 'some_other']);

```
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- [Sakibur Rahman Khan (Saad)](https://www.github.com/protibimbok)


## Feedback

If you have any feedback or feature request, please reach out to us at [Github](https://github.com/protibimbok/express-route-helper)