/* @flow */
"use strict";

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongo from 'mongodb';
import Q from 'q';

const C = {
    MOST_LIKED: {
        AUTHORS:    "authors",
        SOURCES:    "sources",
        UNAUTHORED: "unauthored",
        UNSOURCED:  "unsourced",
        MYSTERIOUS: "mysterious"
    }
};

const dbClient = function(){
    const _client = mongo.MongoClient;
    const _dbUrl = "mongodb://localhost:27017/";
    let _db;
    let _isConnected = false;

    function _resolver(deferred, err, res){
        if(err){
            console.error("[dbClient._resolver] something went wrong! err:", err);
            deferred.reject(err);
        }
        else{
            deferred.resolve(res);
        }
    }

    return {
        connect(dbName){
            console.log("[dbClient.connect] dbName:", dbName);
            _client.connect(_dbUrl + dbName, (err, db) => {
                if(err){
                    console.error("[dbClient.connect] Couldn't connect to MongoDB! err:", err);
                    process.exit(1);
                }
                else{
                    _db = db;
                    _isConnected = true;
                    console.log("[dbClient.connect] Connected to MongoDB");
                }
            });
        },
        mostLiked(target, limit) {
            console.log("[dbClient.mostLiked] target:", target,", limit:", limit);


            let deferred = Q.defer();
            if(target === C.MOST_LIKED.AUTHORS){
                _db.collection('quotes').aggregate([
                    {"$group":{"_id":"$author_id","total_likes":{"$sum":"$likes"}}}
                    ,{"$sort":{"total_likes":-1}}
                    ,{"$limit":3}
                ]).toArray(_resolver.bind(this, deferred));
            }
            else if(target === C.MOST_LIKED.SOURCES){
                _db.collection('quotes').aggregate([
                    {"$match": {"source_id": {"$ne": null}}}
                    ,{"$group":{"_id":"$source_id","total_likes":{"$sum":"$likes"}}}
                    ,{"$sort":{"total_likes":-1}}
                    ,{"$limit": limit}
                ]).toArray(_resolver.bind(this, deferred));
            }
            else if(target === C.MOST_LIKED.UNSOURCED){
                _db.collection('quotes').aggregate([
                    {"$match": {"source_id": null, "author_id": {"$ne": null}}}
                    ,{"$sort": {"likes": -1}}
                    ,{"$limit": limit}
                ]).toArray(_resolver.bind(this, deferred));
            }
            else if(target === C.MOST_LIKED.MYSTERIOUS){
                _db.collection('quotes').aggregate([
                    {"$match": {"source_id": null, "author_id": null}}
                    ,{"$sort": {"likes": -1}}
                    ,{"$limit": limit}
                ]).toArray(_resolver.bind(this, deferred));
            }

            return deferred.promise;
        },
        getAuthor(authorId) {
            console.log("[dbClient.getAuthor] authorId:", authorId);
            let deferred = Q.defer();
            let author = null;
            _db.collection('authors').findOne({"_id": authorId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        isConnected(){
            return _isConnected;
        }
    }
}();

const UTILS = {
    camelCase(s) {
        return (s||'').toLowerCase().replace(/(\b|_)\w/g, function(m) {
            return m.toUpperCase().replace(/_/,' ');
        });
    }
};

dbClient.connect("quotable-dev");
const app = express();

app.use(express.static(__dirname + '/../public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* Most Liked URL Pattern
   /api/mostLiked/authors
   /api/mostLiked/sources
   /api/mostLiked/unsourced
   /api/mostLiked/unauthored
   /api/mostLiked/
*/
app.route('/api/mostLiked/:target?')
.get((req, resp, next) => {
    console.log("[/api/mostLiked] target:", req.params.target,", limit:", req.query.limit);
    const target = req.params.target || C.MOST_LIKED.MYSTERIOUS;
    const limit = req.query.limit;
    dbClient.mostLiked(target, parseInt(limit, 10)).then((data) => {
        console.log(`[/api/mostLiked/${target}] data.length:`, data.length);
        resp.json(data);
    }).catch((err) => {
        console.error(`[/api/mostLiked/${target}] err:`, err);
        resp.sendStatus(500);
    });
});

app.route('/api/authors/:authorId?')
.get((req, resp, next) => {
    console.log("[/api/authors] authorId:", req.params.authorId);
    const authorId = UTILS.camelCase(req.params.authorId);
    dbClient.getAuthor(authorId).then((data) => {
        console.log(`[/api/authors/${authorId}] data:`, data);
        resp.json(data);
    }).catch((err) => {
        console.error(`[/api/authors/${authorId}] err:`, err);
        resp.sendStatus(500);
    });
});

app.listen(3000, () => console.log("Express Server listening on port 3000"));
