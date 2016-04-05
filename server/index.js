/* @flow */
"use strict";

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const app = express();

app.use(express.static(__dirname + '/../public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
    res.send("Hello Quotable! BITCHES! \n");
}).listen(3000, () => console.log("Express Server listening on port 3000"));
