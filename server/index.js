/*@flow*/
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongo from 'mongodb';
import Q from 'q';
import bcrypt from 'bcrypt-nodejs';
import dateFormat from 'dateformat';

const C = {
    MOST_LIKED: {
        AUTHORS:    "authors",
        SOURCES:    "sources",
        UNAUTHORED: "unauthored",
        UNSOURCED:  "unsourced",
        MYSTERIOUS: "mysterious"
    }
};

const dbClient = function() : Object {
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
        connect(dbName : string ) : void {
            console.log(`[dbClient.connect] dbName:${dbName}`);
            _client.connect(_dbUrl + dbName, (err, db) => {
                if(err){
                    console.error("[dbClient.connect] Couldn't connect to MongoDB! err:", err);
                    process.exit(1);
                }
                else{
                    _db = db;
                    _isConnected = true;
                }
            });
        },
        mostLiked(target:string, limit : number =3) : Object {
            console.log("[dbClient.mostLiked] target:", target,", limit:", limit);
            let deferred = Q.defer();
            if(target === C.MOST_LIKED.AUTHORS){
                _db.collection('quotes').aggregate([
                    {"$match": {"author_id": {"$ne": null}}}
                    ,{"$group":{"_id":"$author_id","total_likes":{"$sum":"$likes"}}}
                    ,{"$sort":{"total_likes":-1}}
                    ,{"$limit":limit}
                ]).toArray(_resolver.bind(this, deferred));
            }
            else if(target === C.MOST_LIKED.SOURCES){
                _db.collection('quotes').aggregate([
                    {"$match": {"source_id": {"$ne": null}}}
                    ,{"$project" : { "author_id" : 1 , "source_id" : 1, "likes": 1 } }
                    ,{"$group":{"_id":"$source_id","author_id":{"$addToSet":"$author_id"},"total_likes":{"$sum":"$likes"}}}
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
        getTotalLikes(what:string, id:string) : Object {
            console.log("[dbClient.getTotalLikes] what:", what,", id:",id);
            let deferred = Q.defer();
            let whatId = what+"_id";
            let matchVal = {};
            matchVal[whatId] = id;
            _db.collection('quotes').aggregate([
                {"$match": matchVal},
                {"$group":{"_id":"$"+whatId,"total_likes":{"$sum":"$likes"}}}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        getUser(userId:string) : Object {
            console.log("[dbClient.getUser] userId:", userId);
            let deferred = Q.defer();
            _db.collection('users').findOne({"_id": userId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getAuthor(authorId:string) : Object {
            console.log("[dbClient.getAuthor] authorId:", authorId);
            let deferred = Q.defer();
            _db.collection('authors').findOne({"_id": authorId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getQuotesBySource(sourceId:string, limit : number =20) : Object {
            console.log("[dbClient.getQuotesBySource] sourceId:", sourceId,", limit:", limit);
            let deferred = Q.defer();
            _db.collection('quotes').aggregate([
                {"$match": {"source_id": sourceId}}
                ,{"$sort": {"likes": -1}}
                ,{"$limit":limit}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        getQuotesByAuthor(authorId:string, limit : number =20) : Object {
            console.log("[dbClient.getQuotesByAuthor] authorId:", authorId,", limit:", limit);
            let deferred = Q.defer();
            _db.collection('quotes').aggregate([
                {"$match": {"author_id": authorId, "source_id": null}}
                ,{"$sort": {"likes": -1}}
                ,{"$limit":limit}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        getUserById(userId:string) : Object {
            console.log("[dbClient.getUserById] userId:", userId);
            let deferred = Q.defer();
            _db.collection('users').findOne({"_id": userId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getContributionsByUser(userId:string, limit : number =20) : Object {
            console.log("[dbClient.getContributionsByUser] userId:", userId);
            let deferred = Q.defer();
            _db.collection('contributions').aggregate([
                {"$match": {"who": userId}}
                ,{"$sort": {"likes": -1}}
                ,{"$limit":limit}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        addUser(newUser:Object) : Object {
            console.log("[dbClient.addUser] newUser:", newUser);
            const deferred = Q.defer();
            _db.collection('users').insertOne(newUser, (err, item) => {
                _resolver(deferred, err, newUser);
            });
            return deferred.promise;
        },
        verifyCredentials(credentials : Object ) : Object {
            console.log("[dbClient.verifyCredentials] credentials.id:",credentials.id);
            const deferred = Q.defer();
            _db.collection('users').findOne({"_id": credentials.id, "hash_p": credentials.hash_p}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getLikeByUser(quoteId:string,userId:string) : Object {
            console.log("[dbClient.getLikeByUser] quoteId:",quoteId,", userId:",userId);
            const deferred = Q.defer();
            _db.collection('likes').findOne({"user_id": userId, "quote_id": quoteId}, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        getUserLikes(userId:string,limit : number =20) : Object {
            console.log("[dbClient.getUserLikes] userId:",userId,", limit:",limit);
            const deferred = Q.defer();
            _db.collection('likes').aggregate([
                {"$match": {"user_id": userId}}
                ,{"$sort": {"datetime": -1}}
                ,{"$limit":limit}
            ]).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        findUserLikes(userId:string,quoteIds:string) : Object {
            console.log("[dbClient.findUserLikes] userId:",userId,", quoteIds:",quoteIds);
            const deferred = Q.defer();
            _db.collection('likes').find({
                user_id: userId,
                $or:[
                    {quote_id: {$in: quoteIds.split(",")}}
                ]
            },{quote_id: true}).toArray(_resolver.bind(this, deferred));
            return deferred.promise;
        },
        addLike(quoteId:string, userId:string) : Object {
            console.log("[dbClient.addLike] quoteId:",quoteId,", userId:",userId);
            const deferred = Q.defer();
            const like = {
                "user_id": userId,
                "quote_id": quoteId,
                "datetime": dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
            };
            _db.collection('likes').insertOne(like, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        deleteLike(quoteId:string, userId:string) : Object {
            console.log("[dbClient.deleteLike] quoteId:",quoteId,", userId:",userId);
            const deferred = Q.defer();
            const like = {
                "user_id": userId,
                "quote_id": quoteId
            };
            _db.collection('likes').findOneAndDelete(like, (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        incrementQuoteLikeCount(quoteId:string) : Object {
            console.log("[dbClient.incrementQuoteLikeCount] quoteId:",quoteId);
            const deferred = Q.defer();
            _db.collection('quotes').findOneAndUpdate(
                {_id: quoteId},
                {$inc: {likes: 1}}
            , (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        decrementQuoteLikeCount(quoteId:string) : Object {
            console.log("[dbClient.decrementQuoteLikeCount] quoteId:",quoteId);
            const deferred = Q.defer();
            _db.collection('quotes').findOneAndUpdate(
                {_id: quoteId},
                {$inc: {likes: -1}}
            , (err, item) => {
                _resolver(deferred, err, item);
            });
            return deferred.promise;
        },
        toggleLike(quoteId:string, userId:string, action:string) : Object {
            console.log("[dbClient.toggleLike] quoteId:",quoteId,", userId:",userId, ", action:",action);
            const deferred = Q.defer();
            if(action === "like"){
                this.addLike(quoteId, userId).then((added)=>{
                    this.incrementQuoteLikeCount(quoteId).then((incremented) => {
                        deferred.resolve({added:added, incremented:incremented});
                    });
                });
            }
            else if (action === "unlike"){
                this.deleteLike(quoteId, userId).then((deleted)=>{
                    this.decrementQuoteLikeCount(quoteId).then((decremented) => {
                        deferred.resolve({deleted:deleted, decremented:decremented});
                    });
                });
            }
            return deferred.promise;
        },
        isConnected() : boolean {
            return _isConnected;
        }
    }
}();

dbClient.connect("quotable-dev");
const app = express();

app.use(express.static(__dirname + '/../public'));
app.use(morgan('dev')); // HTTP Request Logger
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
    const limit = parseInt(req.query.limit,10);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.mostLiked(target, limit).then(bf).catch(bf);
});

app.route('/api/:what/:id/likes/total')
.get((req, resp, next) => {
    console.log("[/api/:what/:id/likes/total] target:", req.params.what,", id:", req.params.id);
    const what = req.params.what;
    const id = req.params.id;
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getTotalLikes(what, id).then(bf).catch(bf);
});

app.route('/api/users/:userId?')
.get((req, resp, next) => {
    //console.log("[/api/users] userId:", req.params.userId);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getUser(req.params.userId).then(bf).catch(bf);
});

app.route('/api/users/:userId/contributions')
.get((req, resp, next) => {
    //console.log(`[/api/users/${req.params.userId}/contributions]`);
    const bf = _genericDbResult.bind(this, resp);
    const limit = parseInt(req.query.limit, 10)
    dbClient.getContributionsByUser(req.params.userId, limit).then(bf).catch(bf);
});

app.route('/api/users/:userId/likes')
.get((req, resp, next) => {
    const bf = _genericDbResult.bind(this, resp);
    const limit = parseInt(req.query.limit, 10)
    const quoteIds = req.query.quotes;
    //console.log(`[/api/users/${req.params.userId}/likes] limit: ${limit}, quoteIds: ${quoteIds}`);
    if(!isNaN(limit))
        dbClient.getUserLikes(req.params.userId, limit).then(bf).catch(bf);
    else
        dbClient.findUserLikes(req.params.userId, quoteIds).then(bf).catch(bf);
});

app.route('/api/authors/:authorId?')
.get((req, resp, next) => {
    //console.log("[/api/authors] authorId:", req.params.authorId);
    const bf = _genericDbResult.bind(this, resp);
    dbClient.getAuthor(req.params.authorId).then(bf).catch(bf);
});

app.route('/api/authors/:authorId/quotes')
.get((req, resp, next) => {
    //console.log(`[/api/authors/${req.params.authorId}]`);
    const bf = _genericDbResult.bind(this, resp);
    const limit = parseInt(req.query.limit,10);
    dbClient.getQuotesByAuthor(req.params.authorId, limit).then(bf).catch(bf);
});

app.route('/api/sources/:sourceId/quotes')
.get((req, resp, next) => {
    //console.log("[/api/sources/] sourceId:", req.params.sourceId);
    const bf = _genericDbResult.bind(this, resp);
    const limit = parseInt(req.query.limit,10);
    dbClient.getQuotesBySource(req.params.sourceId, limit).then(bf).catch(bf);
});

app.post('/api/verifyCredentials', jsonParser, (req, resp) => {
    //console.log("[/api/verifyCredentials/] body:", req.body);

    if(!req.body) return resp.sendStatus(400);
    let credentials = req.body || {};

    if(!credentials.id || !credentials.password)
        resp.sendStatus(400);
    else {
        dbClient.getUserById(credentials.id).then((result) => {
            if(result){
                bcrypt.compare(credentials.password, result.hash_p, function(err, matches) {
                    if (err)
                        resp.sendStatus(500);
                    else if (matches){
                        // TODO: Should send back the hash?!
                        resp.status(200).json({uri: `/users/${credentials.id}`, signedin: true, user: result});
                    }
                    else
                        resp.status(401).send(`Wrong credentials. Please try again.`);
                });
            }
            else
                resp.status(401).send(`Wrong credentials. Please try again.`);
        }).catch((error) => {
            console.error("[/api/signup/] error", error);
            resp.sendStatus(500);
        });
    }
});

app.post('/api/signup', jsonParser, (req, resp) => {
    //console.log("[/api/signup/] body:", req.body);

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
        dbClient.getUserById(newUser.id).then((result) => {
            console.log("[/api/signup/getUserById] result:", result);
            if(result){
                resp.status(409).send(`Username "${newUser.id}" already exists. Please try another.`);
            }
            else{
                _preprocessNewUser(newUser).then((ppnuser) => {
                    console.log("[/api/signup/_preprocessNewUser/then] ppnuser:", ppnuser);
                    dbClient.addUser(ppnuser).then((result) => {
                        console.log("[/api/signup/_preprocessNewUser/addUser/then] result:", result);
                        resp.status(201).json({uri: `/users/${ppnuser._id}`, user: result});
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

app.post('/api/quotes/:quoteId/like', jsonParser, (req, resp) => {
    console.log(`[/api/quotes/${req.params.quoteId}/like] body:`, req.body);
    if(!req.body) return resp.sendStatus(400);
    const quoteId = req.params.quoteId;
    const userId = req.body.userId;
    const action = req.body.action;

    dbClient.toggleLike(quoteId, userId, action).then((result) => {
        console.log(`[/api/quotes/${quoteId}/like/toggleLike.then] result:`, result);
        resp.status(200).json(result);
    }).catch((error) => {
        console.error("[/api/signup/] error", error);
        resp.sendStatus(500);
    });
});

app.listen(3000, () => console.log("Express Server listening on port 3000"));
