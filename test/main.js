import express from "express";
import expressR from "../main.js";

const app = express();

/*

app.all('/', (req, res, next)=>{
    console.log('USE /');
    next();
});
app.get('/', (req, res, next)=>{
    console.log('GET /');
    next();
});
app.get('/app', (req, res, next)=>{
    console.log('GET /app');
    next();
});

app.get('/app',(req, res)=>{
    res.send('App');
});


app.get('/',(req, res)=>{
    res.send('Home');
});
*/

await expressR(app, 'test/routes', 'test/middlewares');

app.listen(7223, ()=>{
    console.log('http://localhost:7223');
});