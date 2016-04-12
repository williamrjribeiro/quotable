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

app.route('/api/toppers')
.get((req, resp, next) => {
    console.log("[/api/toppers]");
    let toppers = {
        authors: [{
            authorName: "William Shakespere",
            likes: 100
        },{
            authorName: "Neil Gaiman",
            likes: 200
        },{
            authorName: "Jaron Lanier",
            likes: 300
        }],
        quotes: [{
            authorName: "William Shakespere",
            text: "Love all, trust a few, do wrong to none.",
            likes: 50
        },{
            authorName: "Neil Gaiman",
            text: "Sometimes the best way to learn something is by doing it wrong and looking at what you did.",
            likes: 100
        },{
            authorName: "Jaron Lanier",
            text: "Criticism is always easier than constructive solutions.",
            likes: 150
        }]
    };
    let t = setTimeout(() => {
        clearTimeout(t);
        resp.json(toppers);
    }, 1000);
});

app.listen(3000, () => console.log("Express Server listening on port 3000"));
// mongoimport --db olympics-dev --collection sports --type json --file server/sports-seed.json --jsonArray --drop
