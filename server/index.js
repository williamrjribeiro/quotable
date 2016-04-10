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
