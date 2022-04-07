import express from "express";
import expressR from "../main.js";

const app = express();
await expressR(app, 'test/routes', 'test/middlewares');

app.listen(7223, ()=>{
    console.log('http://localhost:7223');
});