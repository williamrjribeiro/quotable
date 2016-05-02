/* @flow */
"use strict";

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongo from 'mongodb';
import Q from 'q';
import bcrypt from 'bcrypt-nodejs';

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
            err.isError = true;
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
        mostLiked(target:string, limit:number) {
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
        getAuthor(authorId:string){
            console.log("[dbClient.getAuthor] authorId:", authorId);
            let deferred = Q.defer();
            _db.collection('authors').findOne({"_id": authorId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getQuotesBySource(sourceId:string){
            console.log("[dbClient.getQuotesBySource] sourceId:", sourceId);
            let deferred = Q.defer();
            _db.collection('quotes').aggregate([
                {"$match": {"source_id": sourceId}}
                ,{"$sort": {"likes": -1}}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        getQuotesByAuthor(authorId:string){
            console.log("[dbClient.getQuotesByAuthor] authorId:", authorId);
            let deferred = Q.defer();
            _db.collection('quotes').aggregate([
                {"$match": {"author_id": authorId, "source_id": null}}
                ,{"$sort": {"likes": -1}}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        getUserById(userId:string){
            console.log("[dbClient.getUserById] userId:", userId);
            let deferred = Q.defer();
            _db.collection('users').findOne({"_id": userId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        addUser(newUser:Object){
            console.log("[dbClient.addUser] newUser:", newUser);
            const deferred = Q.defer();
            _db.collection('users').insertOne(newUser, (err, item) => {
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

const jsonParser = bodyParser.json();

function _genericDbResult(resp, result){
    if(result.isError)
        resp.sendStatus(500);
    else
        resp.json(result);
}

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
    const bf = _genericDbResult.bind(this, resp);
    dbClient.mostLiked(target, parseInt(limit, 10)).then(bf).catch(bf);
});

app.route('/api/authors/:authorId?')
.get((req, resp, next) => {
    console.log("[/api/authors] authorId:", req.params.authorId);
    const authorId = UTILS.camelCase(req.params.authorId);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getAuthor(authorId).then(bf).catch(bf);
});

app.route('/api/authors/:authorId/quotes')
.get((req, resp, next) => {
    console.log(`[/api/authors/${req.params.authorId}]`);
    const authorId = UTILS.camelCase(req.params.authorId);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getQuotesByAuthor(authorId).then(bf).catch(bf);
});

app.route('/api/sources/:sourceId/quotes')
.get((req, resp, next) => {
    console.log("[/api/sources/] sourceId:", req.params.sourceId);
    const sourceId = UTILS.camelCase(req.params.sourceId);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getQuotesBySource(sourceId).then(bf).catch(bf);
});

app.post('/api/signup', jsonParser, (req, resp) => {
    console.log("[/api/signup/] body:", req.body);

    function _preprocessNewUser(newUser){
        console.log("[/api/signup/_preprocessNewUser]");
        const deferred = Q.defer();
        let ppnuser = {
            name: newUser.name,
            _id: newUser.id,
            role: newUser.role,
            email: newUser.email,
            hash_p: ""
        };

        bcrypt.hash(newUser.password,null,null,(err, hash) => {
            if(err) {
                console.warn("[/api/signup/_preprocessNewUser] err:", err);
                deferred.reject(err);
            }
            else{
                ppnuser.hash_p = hash;
                deferred.resolve(ppnuser);
            }
        });

        return deferred.promise;
    }

    if(!req.body) return resp.sendStatus(400);
    let newUser = req.body || {};

    if(!newUser.id || !newUser.name || !newUser.password || !newUser.email || !newUser.role )
        resp.sendStatus(400);
    else {
        //const hp = UTILS.hashPassword(user.password);
        dbClient.getUserById(newUser.id).then((result) => {
            console.log("[/api/signup/getUserById] result:", result);
            if(result){
                resp.status(409).send(`Username "${newUser.id}" already exists. Please try another.`);
            }
            else{
                _preprocessNewUser(newUser).then((ppnuser) => {
                    console.log("[/api/signup/_preprocessNewUser/then] ppnuser:", ppnuser);
                    dbClient.addUser(ppnuser).then((result) => {
                        resp.status(201).json({uri: `/users/${ppnuser._id}`, user: ppnuser});
                    });
                }).catch((err) => {
                    console.error("[/api/signup/getUserById] err:", err);
                    resp.sendStatus(500);
                });
            }
        }).catch((error) => {
            console.error("[/api/signup/] error", error);
            resp.sendStatus(500);
        });
    }
});

app.listen(3000, () => console.log("Express Server listening on port 3000"));
