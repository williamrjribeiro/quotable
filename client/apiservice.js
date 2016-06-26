/* @flow */
export default class ApiService {
    _$http: Function;
    _$rootScope: Object;
    _$q: Function;
    constructor($http : Function , $q  : Function, $rootScope : Object){
        'ngInject';
        console.log("[ApiService] $q:", typeof $q,", $http:", typeof $http,", $rootScope:", typeof $rootScope);
        this._$http = $http;
        this._$rootScope = $rootScope;
        this._$q = $q;
    }

    mostLiked (collectionName  : string = "mysterious", limit : number = 3) : Object {
        console.log("[ApiService.mostLiked] collectionName: " + collectionName + ', limit: ' + limit);
        /* Most Liked URL Pattern
           /api/mostLiked/authors
           /api/mostLiked/sources
           /api/mostLiked/unsourced
           /api/mostLiked/unauthored
           /api/mostLiked/
        */
        if(collectionName === "authors" || collectionName === "sources")
            return this._$http.get(`/api/mostLiked/${collectionName}?limit=${limit}`);
        else {
            // Testing $http.transformResponse to add keep loadedQuotes on the this._$rootScope
            return this._$http({
                url:`/api/mostLiked/${collectionName}?limit=${limit}`,
                method: 'GET',
                transformResponse: this._appendTransform(this._$http.defaults.transformResponse, (value) => {
                    this._$rootScope.loadedQuotes.add(value._id);
                    return value;
                })
            });
        }
    }

    getTotalLikes(args:Object) : Object {
        console.log("[ApiService.getTotalLikes] args:",args);
        return this._$http.get(`/api/${args.what}/${args.id}/likes/total`);
    }

    getUser(userId : string) : Object {
        console.log("[ApiService.getUser] userId:",userId);
        return this._$http.get(`/api/users/${userId}`);
    }

    getUserLikes(userId : string, limit : number =50) : Object {
        console.log("[ApiService.getUser] userId:",userId);
        return this._$http.get(`/api/users/${userId}/likes?limit=${limit}`);
    }

    getAuthor(authorId : string) : Object {
        console.log("[ApiService.getAuthor] authorId:",authorId);
        return this._$http.get(`/api/authors/${authorId}`);
    }

    getQuotesBySource(sourceId : string, limit : number =20) : Object {
        console.log("[ApiService.getQuotesBySource] sourceId:",sourceId);
        // Testing $q to add keep loadedQuotes on the this._$rootScope
        let deferred = this._$q.defer();
        this._$http.get(`/api/sources/${sourceId}/quotes?limit=${limit}`).then((resp) => {
            resp.data.map((item) => {
                this._$rootScope.loadedQuotes.add(item._id);
            });
            deferred.resolve(resp);
        });
        return deferred.promise;
    }

    getQuotesByAuthor(authorId : string, limit : number =20) : Object {
        console.log("[ApiService.getQuotesByAuthor] authorId:",authorId);
        // Testing $http.transformResponse to add keep loadedQuotes on the this._$rootScope
        return this._$http({
            url:`/api/authors/${authorId}/quotes?limit=${limit}`,
            method: 'GET',
            transformResponse: this._appendTransform(this._$http.defaults.transformResponse, (value) => {
                this._$rootScope.loadedQuotes.add(value._id);
                return value;
            })
        });
    }

    getContributionsByUser(userId : string, limit : number =20) : Object {
        console.log("[ApiService.getContributionsByUser] userId:",userId);
        return this._$http.get(`/api/users/${userId}/contributions?limit=${limit}`);
    }

    addUser(user:Object) : Object {
        console.log("[ApiService.addUser] user.id:",user.id);
        return this._$http.post(`/api/signup`, user);
    }

    verifyCredentials(credentials:Object) : Object {
        console.log("[ApiService.verifyCredentials] credentials.id:",credentials.id);
        return this._$http.post(`/api/verifyCredentials`, credentials);
    }

    toggleLike(quoteId:string, userId:string, action:string) : Object {
        console.log("[ApiService.toggleLike] quoteId:",quoteId,", userId:", userId,", action:", action);
        return this._$http.post(`/api/quotes/${quoteId}/like`, {userId: userId, action: action});
    }

    findUserLikes(userId:string, quotes : Array<Object>) : Object {
        console.log("[ApiService.findUserLikes] userId:",userId,", quotes.length:", quotes.length);
        let deferred = this._$q.defer();
        let quoteIds = [];
        quotes.map((item) => {
            item.hasLiked = false;
            quoteIds.push(item._id);
        });
        this._$http.get(`/api/users/${userId}/likes?quotes=${quoteIds}`).then((resp) => {
            const foundLikes = resp.data;
            // Testing reverse loop instead of Array.find()
            quotes.map((it) => {
                for(let i = foundLikes.length - 1; i >= 0; i--){
                    if(it._id === foundLikes[i].quote_id){
                        it.hasLiked = true;
                        break;
                    }
                }
            });
            deferred.resolve(quotes);
        });
        return deferred.promise;
    }

    _appendTransform(defaults : Array<Object>, transform : Function) : Array<Object> {
        //console.log("[ApiService._appendTransform]");
        // We can't guarantee that the default transformation is an array
        defaults = Array.isArray(defaults) ? defaults : [defaults];
        // Append the new transformation to the defaults
        return defaults.concat(transform);
    }
}
