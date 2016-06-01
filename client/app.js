/* @flow */
import angular from 'angular';
import 'angular-ui-router';
import {Utils} from '../crossenv/utils';
angular.module('quotable', ['ui.router'] )
.factory('ApiService', ['$http','$q','$rootScope', function ApiServiceFactory($http, $q, $rootScope){
    function _appendTransform(defaults, transform) {
        //console.log("[ApiService._appendTransform]");
        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];
        // Append the new transformation to the defaults
        return defaults.concat(transform);
    }

    return {
        mostLiked (collectionName="mysterious",limit=3) : Object {
            console.log("[ApiService.mostLiked] collectionName: " + collectionName + ', limit: ' + limit);
            /* Most Liked URL Pattern
               /api/mostLiked/authors
               /api/mostLiked/sources
               /api/mostLiked/unsourced
               /api/mostLiked/unauthored
               /api/mostLiked/
            */
            if(collectionName === "authors" || collectionName === "sources")
                return $http.get(`/api/mostLiked/${collectionName}?limit=${limit}`);
            else {
                // Testing $http.transformResponse to add keep loadedQuotes on the $rootScope
                return $http({
                    url:`/api/mostLiked/${collectionName}?limit=${limit}`,
                    method: 'GET',
                    transformResponse: _appendTransform($http.defaults.transformResponse, (value) => {
                        $rootScope.loadedQuotes.add(value._id);
                        return value;
                    })
                });
            }
        },
        getUser(userId : string) : Object {
            console.log("[ApiService.getUser] userId:",userId);
            return $http.get(`/api/users/${userId}`);
        },
        getUserLikes(userId : string, limit=50) : Object {
            console.log("[ApiService.getUser] userId:",userId);
            return $http.get(`/api/users/${userId}/likes?limit=${limit}`);
        },
        getAuthor(authorId : string) : Object {
            console.log("[ApiService.getAuthor] authorId:",authorId);
            return $http.get(`/api/authors/${authorId}`);
        },
        getQuotesBySource(sourceId : string, limit=20) : Object {
            console.log("[ApiService.getQuotesBySource] sourceId:",sourceId);
            // Testing $q to add keep loadedQuotes on the $rootScope
            let deferred = $q.defer();
            $http.get(`/api/sources/${sourceId}/quotes?limit=${limit}`).then((resp) => {
                resp.data.map((item) => {
                    $rootScope.loadedQuotes.add(item._id);
                });
                deferred.resolve(resp);
            });
            return deferred.promise;
        },
        getQuotesByAuthor(authorId : string, limit=20) : Object {
            console.log("[ApiService.getQuotesByAuthor] authorId:",authorId);
            // Testing $http.transformResponse to add keep loadedQuotes on the $rootScope
            return $http({
                url:`/api/authors/${authorId}/quotes?limit=${limit}`,
                method: 'GET',
                transformResponse: _appendTransform($http.defaults.transformResponse, (value) => {
                    $rootScope.loadedQuotes.add(value._id);
                    return value;
                })
            });
        },
        getContributionsByUser(userId : string, limit=20) : Object {
            console.log("[ApiService.getContributionsByUser] userId:",userId);
            return $http.get(`/api/users/${userId}/contributions?limit=${limit}`);
        },
        addUser(user:Object) : Object {
            console.log("[ApiService.addUser] user.id:",user.id);
            return $http.post(`/api/signup`, user);
        },
        verifyCredentials(credentials:Object) : Object {
            console.log("[ApiService.verifyCredentials] credentials.id:",credentials.id);
            return $http.post(`/api/verifyCredentials`, credentials);
        },
        toggleLike(quoteId:string, userId:string, action:string) : Object {
            console.log("[ApiService.toggleLike] quoteId:",quoteId,", userId:", userId,", action:", action);
            return $http.post(`/api/quotes/${quoteId}/like`, {userId: userId, action: action});
        },
        findUserLikes(userId:string, quotes) : Object {
            console.log("[ApiService.findUserLikes] userId:",userId,", quotes.length:", quotes.length);
            let deferred = $q.defer();
            let quoteIds = [];
            quotes.map((item) => {
                item.hasLiked = false;
                quoteIds.push(item._id);
            });
            $http.get(`/api/users/${userId}/likes?quotes=${quoteIds}`).then((resp) => {
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
    };
}])
.factory('BaseStateCtrl', ['$state','$q','$rootScope', function BaseStateCtrlFactory($state, $q, $rootScope){
    $rootScope.loadedQuotes = new Set();
    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
        console.warn("[BaseStateCtrl.stateChangeStart] toState: "+toState.name+", loadedQuotes.length: "+$rootScope.loadedQuotes.length);
        $rootScope.loadedQuotes = new Set();
    });
    return {
        signOut() : void {
            console.log("[BaseStateCtrl.signOut] userCredentials:", $rootScope.userCredentials);
            $rootScope.userCredentials = null;
            $state.go("toppers");
        },
        toAuthorState(id: string): void{
            console.log("[BaseStateCtrl.toAuthorState] id:", id);
            $state.go('author', {authorId: id});
        },toSourceState(authorId: string, sourceId: string): void{
            console.log("[BaseStateCtrl.toSourceState] authorId:",authorId, ",sourceId", sourceId);
            $state.go('source', {authorId: authorId, sourceId: sourceId});
        },toQuotesState(id: string): void{
            console.log("[BaseStateCtrl.toQuotesState] id:", id);
            $state.go('author.source.quotes', {sourceId: id});
        },
        toProfileState(id: string): void{
            console.log("[BaseStateCtrl.toProfileState] id:", id);
            $state.go('profile', {userId: id});
        },
        displayLang(lang: string): string {
            console.log("[BaseStateCtrl.displayLang] lang:", lang);
            switch(lang){
                case "eng": return "English";
                default: return lang;
            }
        }
    };
}])
.config(($stateProvider, $urlRouterProvider) => {
    let _selectedUser = null;
    let _selectedAuthor = null;
    let _selectedSource = null;

    $urlRouterProvider.when("/", "toppers");
    $urlRouterProvider.otherwise('toppers');

    $stateProvider.state('toppers',{
        url: '/toppers',
        templateUrl: './partials/toppers.html',
        controller: ($rootScope, $scope, $state, ApiService, BaseStateCtrl) => {
            console.log("[toppers.controller]");

            $scope.BaseStateCtrl = BaseStateCtrl;
            $scope.loadingA = true;
            $scope.loadingB = true;
            $scope.loadingC = true;
            $scope.loadingD = true;

            function _doneLoading(loading:string, collection:string, data){
                $scope[loading] = false;
                $scope[collection] = data;
            }

            ApiService.mostLiked("authors").then((resp) => {
                resp.data.map((item) => {
                    item.name = Utils.camelCase(item._id);
                });
                _doneLoading("loadingA","knownAuthors", resp.data);
            });

            ApiService.mostLiked("sources").then((resp) => {
                resp.data.map((item) => {
                    item.title = Utils.camelCase(item._id);
                });
                $scope.loadingB = false;
                $scope.knownSources = resp.data;
            });

            ApiService.mostLiked("unsourced").then((resp) => {
                let quotes = resp.data;
                // TODO: Refactor this to be more reusable and use it everywhere.
                if($rootScope.userCredentials){
                    ApiService.findUserLikes($rootScope.userCredentials._id, quotes).then((foundLikes) => {
                        _doneLoading("loadingC","unsourcedQuotes", quotes);
                    })
                }
                else
                    _doneLoading("loadingC","unsourcedQuotes", quotes);
            });

            ApiService.mostLiked().then((resp) => {
                let quotes = resp.data;
                if($rootScope.userCredentials){
                    ApiService.findUserLikes($rootScope.userCredentials._id, quotes).then((foundLikes) => {
                        _doneLoading("loadingD","mysteriousQuotes", quotes);
                    })
                }
                else
                    _doneLoading("loadingD","mysteriousQuotes", quotes);
            });
        }
    })
    .state("/signup", {
        url:"/signup",
        templateUrl: "./partials/signup.html",
        controller: ($rootScope, $scope, $state, ApiService) => {
            console.log("[SigunUpCtrl]");
            $scope.addUser = (user) => {
                console.log("[SigunUpCtrl.addUser]");
                ApiService.addUser(user).then((resp) => {
                    console.log("[SigunUpCtrl.addUser.then] resp:", resp);
                    $rootScope.userCredentials = resp.data.user;
                    _selectedUser = resp.data.user;
                    $state.go("profile", {userId: _selectedUser._id});
                }).catch((err) => {
                    console.warn(err);
                });
            };
        },
        controllerAs: "SignUpCtrl"
    })
    .state("/signin", {
        url:"/signin",
        templateUrl: "./partials/signin.html",
        controller: ($rootScope, $scope, $state, ApiService) => {
            console.log("[SignInCtrl]");
            $scope.verifyCredentials = (credentials) => {
                console.log("[SignInCtrl.verifyCredentials]");
                ApiService.verifyCredentials(credentials).then((resp) => {
                    console.log("[SignInCtrl.verifyCredentials.then] data:", resp.data);
                    $rootScope.userCredentials = resp.data.user;
                    _selectedUser = resp.data.user;
                    $state.go("profile", {userId: _selectedUser._id});
                }).catch((err) => {
                    console.warn(err);
                });
            };
        },
        controllerAs: "SignInCtrl"
    })
    .state("profile", {
        url:"/users/:userId",
        templateUrl: "./partials/profile.html",
        controller: ($rootScope, $stateParams, $scope, $state, ApiService, BaseStateCtrl) => {
            console.log("[ProfileCtrl] userId:", $stateParams.userId);
            $scope.BaseStateCtrl = BaseStateCtrl;

            const userId = $stateParams.userId;
            if(_selectedUser && _selectedUser._id === userId)
                $scope.user = _selectedUser;
            else {
                ApiService.getUser(userId).then((resp) => {
                    console.log("[ProfileCtrl.getUser.then] data:", resp.data);
                    $scope.user = resp.data;
                    _selectedUser = resp.data;
                }).catch((err) => {
                    console.warn(err);
                });
            }

            $scope.loadingContribs = true;
            ApiService.getContributionsByUser(userId).then((resp) => {
                console.log("[ProfileCtrl.getContributionsByUser.then] data:", resp.data);
                $scope.contributions = resp.data;
                $scope.loadingContribs = false;
            }).catch((err) => {
                console.warn(err);
            });

            $scope.loadingLikes = true;
            ApiService.getUserLikes(userId).then((resp) => {
                console.log("[ProfileCtrl.getUserLikes.then] data:", resp.data);
                $scope.userLikes = resp.data;
                $scope.loadingLikes = false;
            }).catch((err) => {
                console.warn(err);
            });
        },
        controllerAs: "ProfileCtrl"
    })
    .state('author',{
        url: '/:authorId',
        templateUrl: './partials/author.html',
        controller: ($stateParams, $rootScope, $scope, ApiService, BaseStateCtrl) => {
            console.log("[authorCtrl] authorId:", $stateParams.authorId);
            const authorId = $stateParams.authorId;
            $scope.BaseStateCtrl = BaseStateCtrl;
            $scope.loadingQuotes = true;
            $scope.onSourceClick = (sourceId) => {
                console.log("[authorCtrl.onSourceClick] sourceId:",sourceId);
                _selectedSource = $scope.author.sources.find((s) => {return s._id === sourceId});
                console.log("[authorCtrl.onSourceClick] _selectedSource:", _selectedSource);
                BaseStateCtrl.toSourceState(authorId, sourceId);
            };

            ApiService.getAuthor(authorId).then((resp) => {
                console.log("[authorCtrl.getAuthor] resp:",resp);
                resp.data.sources.map((item) => {
                    item.disp_lang = BaseStateCtrl.displayLang(item.original_lang);
                });
                $scope.author = resp.data;
                _selectedAuthor = resp.data;
            });

            ApiService.getQuotesByAuthor(authorId).then((resp) => {
                let quotes = resp.data;
                if($rootScope.userCredentials){
                    ApiService.findUserLikes($rootScope.userCredentials._id, quotes).then((foundLikes) => {
                        $scope.unsourcedQuotes = resp.data;
                        $scope.loadingQuotes = false;
                    })
                }
                else{
                    $scope.unsourcedQuotes = resp.data;
                    $scope.loadingQuotes = false;
                }
            });
        },
        controllerAs: 'authorCtrl'
    })
    .state('source',{
        url: '/:authorId/:sourceId',
        templateUrl: './partials/source-quotes.html',
        controller: ($stateParams, $rootScope, $scope, ApiService, BaseStateCtrl) => {
            console.log("[sourceCtrl] _selectedAuthor:", _selectedAuthor,", _selectedSource:", _selectedSource);
            const sourceId = $stateParams.sourceId;
            const authorId = $stateParams.authorId;

            $scope.BaseStateCtrl = BaseStateCtrl;
            $scope.loading = true;
            $scope.quotes = null;
            $scope.author = _selectedAuthor || null;
            $scope.source = _selectedSource || null;

            if(!$scope.author || $scope.author.id !== authorId){
                ApiService.getAuthor(authorId).then((resp) => {
                    resp.data.sources.map((item) => {
                        item.disp_lang = BaseStateCtrl.displayLang(item.original_lang);
                    });
                    $scope.author = resp.data;
                    $scope.source = $scope.author.sources.find((s) => {return s._id === sourceId});
                    _selectedAuthor = resp.data;
                    _selectedSource = $scope.source;
                });
            }
            ApiService.getQuotesBySource(sourceId).then((resp) => {
                let quotes = resp.data;
                if($rootScope.userCredentials){
                    ApiService.findUserLikes($rootScope.userCredentials._id, quotes).then((foundLikes) => {
                        $scope.quotes = resp.data;
                        $scope.loading = false;
                    })
                }
                else{
                    $scope.quotes = resp.data;
                    $scope.loading = false;
                }
            });
        },
        controllerAs: 'sourceCtrl'
    });
})
.controller('AccessViewController', ['$rootScope', '$scope', '$state', ($rootScope, $scope, $state) => {
    console.log("[AccessViewController]");
    $scope.signOut = () => {
        console.log("[AccessViewController.signOut]");
        $rootScope.userCredentials = null;
        $state.go("toppers");
    };
}])
.directive('qtbAccessView', () => {
  return {
    templateUrl: 'partials/acess-view.html'
  };
})
.component('qtbLikes', {
    templateUrl: 'partials/likes.html',
    bindings: {
        val: '<',
        quoteId: '<',
        hasLiked: '<'
    },
    controller: function LikesController($scope, $rootScope, ApiService){
        var ctrl = this;
        ctrl.signedIn = $rootScope.userCredentials ? true : false;
        ctrl.likeLabel = updateLabel(ctrl.val);
        ctrl.likeToggle = ctrl.hasLiked ? "Unlike" : "Like";

        //console.log('[LikesController] ctrl:',ctrl);

        ctrl.toggleLike = () => {
            console.log('[LikesController.toggleLike] quote_id:', ctrl.quote_id,", hasLiked:", ctrl.hasLiked);
            const action = ctrl.hasLiked ? "unlike" : "like";
            ApiService.toggleLike(ctrl.quoteId, $rootScope.userCredentials._id, action).then((resp) => {
                console.log('[LikesController.toggleLike.then] resp:', resp);
                if(!ctrl.hasLiked){
                    ctrl.hasLiked = false;
                    if(ctrl.val === 0)
                        ctrl.val--;
                    ctrl.likeToggle = "Like";
                }
                else {
                    // Like it
                    ctrl.hasLiked = true;
                    ctrl.val++;
                    ctrl.likeToggle = "Unlike";
                }
                ctrl.label = updateLabel(ctrl.val);
            });
        };

        function updateLabel(val:number) : string{
            return " like" + (val !== 1 ? "s":"");
        }
    }
});

angular.module('quotable').config(['$compileProvider', '$httpProvider', ($compileProvider, $httpProvider) => {
    // uncomment for production
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync( true );
}]);
