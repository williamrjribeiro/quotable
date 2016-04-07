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

let coreQuote = {
    name: "Jaron Lanier",
    text: "To be a person you have to find a sweet spot in which you both invent yourself and are real",
    source: "You Are Not A Gadget",
    picture: "url.jpg"
};
let source = {
    id: "s1",
    title: "You Are Not A Gadget",
    type: "book",
    quotes: [
        {
            id: "t1",
            text: "To be a person you have to find a sweet spot in which you both invent yourself and are real.",
            location: "3369-3372",
            tags: ["reality","person"]
        },
        {
            id: "t2",
            text: "What makes something trully real is that it is impossible to represent it to completion.",
            location: "2450-2451",
            tags: ["reality"]
        },
        {
            id: "t3",
            text: "'Troll' is a term for an anonymous person who is abusive in an online environment.",
            location: "1180-1181",
            tags: ["internet","definition"]
        }
    ]
};
let author = {
    id: "a1",
    name: "Jaron Lanier",
    sources: [
        source
    ]
};

/*app.get("/:authorName",(req, resp, next) => {
    console.log("[app.get/:authorName] authorName:", req.params.authorName);
    resp.json({authorName: req.params.authorName});
});
app.get("/:authorName/:sourceTitle",(req, resp, next) => {
    console.log("[app.get/:authorName/:sourceTitle] authorName:", req.params.authorName,', sourceTitle:',req.params.sourceTitle);
    resp.json({authorName: req.params.authorName, sourceTitle: req.params.sourceTitle});
});

app.route('/authors')
.get((res, req, next) => {

});

app.route('/sources')
.get((res, req, next) => {

});
*/
app.listen(3000, () => console.log("Express Server listening on port 3000"));
