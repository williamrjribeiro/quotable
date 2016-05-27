/* @flow */
import angular from 'angular';
import 'angular-ui-router';
import {Utils} from '../crossenv/utils';
angular.module('quotable', ['ui.router'] )
.factory('ApiService', ['$http', function ApiServiceFactory($http){
    return {
        mostLiked (collectionName="mysterious",limit=3) : Object {
            console.log("[ApiService.mostLiked] collectionName:",collectionName,', limit:', limit);
            /* Most Liked URL Pattern
               /api/mostLiked/authors
               /api/mostLiked/sources
               /api/mostLiked/unsourced
               /api/mostLiked/unauthored
               /api/mostLiked/
            */
            return $http.get(`/api/mostLiked/${collectionName}?limit=${limit}`);
        },
        getUser(userId : string) : Object {
            console.log("[ApiService.getUser] userId:",userId);
            return $http.get(`/api/users/${userId}`);
        },
        getAuthor(authorId : string) : Object {
            console.log("[ApiService.getAuthor] authorId:",authorId);
            return $http.get(`/api/authors/${authorId}`);
        },
        getQuotesBySource(sourceId : string, limit=20) : Object {
            console.log("[ApiService.getQuotesBySource] sourceId:",sourceId);
            return $http.get(`/api/sources/${sourceId}/quotes?limit=${limit}`);
        },
        getQuotesByAuthor(authorId : string, limit=20) : Object {
            console.log("[ApiService.getQuotesByAuthor] authorId:",authorId);
            return $http.get(`/api/authors/${authorId}/quotes?limit=${limit}`);
        },
        getContributionsByUser(userId : string, limit=20) : Object {
            console.log("[ApiService.getContributionsByUser] userId:",userId);
            return $http.get(`/api/users/${userId}/contributions?limit=${limit}`);
        },
        addUser(user) : Object {
            console.log("[ApiService.addUser] user.id:",user.id);
            return $http.post(`/api/signup`, user);
        },
        verifyCredentials(credentials) : Object {
            console.log("[ApiService.verifyCredentials] credentials.id:",credentials.id);
            return $http.post(`/api/verifyCredentials`, credentials);
        }
    };
}])
.factory('BaseState', ['$state','$rootScope', function BaseStateFactory($state, $rootScope){
    return {
        signOut() : void {
            console.log("[BaseState.signOut] userCredentials:", $rootScope.userCredentials);
            $rootScope.userCredentials = null;
            $state.go("toppers");
        },
        toAuthorState(id: string): void{
            console.log("[BaseState.toAuthorState] id:", id);
            $state.go('author', {authorId: id});
        },toSourceState(authorId: string, sourceId: string): void{
            console.log("[BaseState.toSourceState] authorId:",authorId, ",sourceId", sourceId);
            $state.go('source', {authorId: authorId, sourceId: sourceId});
        },toQuotesState(id: string): void{
            console.log("[BaseState.toQuotesState] id:", id);
            $state.go('author.source.quotes', {sourceId: id});
        },
        toProfileState(id: string): void{
            console.log("[BaseState.toProfileState] id:", id);
            $state.go('profile', {userId: id});
        },
        displayLang(lang: string): string {
            console.log("[BaseState.displayLang] lang:", lang);
            switch(lang){
                case "eng": return "English";
                default: return lang;
            }
        }
    };
}])
.config(function($stateProvider, $urlRouterProvider){
    let _selectedUser = null;
    let _selectedAuthor = null;
    let _selectedSource = null;

    $urlRouterProvider.when("/", "toppers");
    $urlRouterProvider.otherwise('toppers');

    $stateProvider.state('toppers',{
        url: '/toppers',
        templateUrl: './partials/toppers.html',
        controller: function ($scope, $state, ApiService, BaseState){
            console.log("[toppers.controller]");

            $scope.BaseState = BaseState;
            $scope.loadingA = true;
            $scope.loadingB = true;
            $scope.loadingC = true;
            $scope.loadingD = true;

            ApiService.mostLiked("authors").then((resp) => {
                resp.data.map((item) => {
                    item.name = Utils.camelCase(item._id);
                });
                $scope.loadingA = false;
                $scope.knownAuthors = resp.data;
            });

            ApiService.mostLiked("sources").then((resp) => {
                resp.data.map((item) => {
                    item.title = Utils.camelCase(item._id);
                });
                $scope.loadingB = false;
                $scope.knownSources = resp.data;
            });

            ApiService.mostLiked("unsourced").then((resp) => {
                resp.data.map((item) => {
                    item.author_name = Utils.camelCase(item.author_id);
                });
                $scope.loadingC = false;
                $scope.unsourcedQuotes = resp.data;
            });

            ApiService.mostLiked().then((resp) => {
                $scope.loadingD = false;
                $scope.mysteriousQuotes = resp.data;
            });
        }
    })
    .state("/signup", {
        url:"/signup",
        templateUrl: "./partials/signup.html",
        controller: function ($scope, $state, ApiService){
            console.log("[SigunUpCtrl]");
            $scope.addUser = function(user){
                console.log("[SigunUpCtrl.addUser]");
                ApiService.addUser(user).then((resp) => {
                    console.log("[SigunUpCtrl.addUser.then] resp:", resp);
                    $state.go("toppers");
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
        controller: function ($rootScope, $scope, $state, ApiService){
            console.log("[SignInCtrl]");
            $scope.verifyCredentials = function(credentials){
                console.log("[SignInCtrl.verifyCredentials]");
                ApiService.verifyCredentials(credentials).then((resp) => {
                    console.log("[SignInCtrl.verifyCredentials.then] data:", resp.data);
                    $rootScope.userCredentials = resp.data.user;
                    _selectedUser = resp.data.user;
                    $state.go("profile", {userId: $rootScope.userCredentials._id});
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
        controller: function ($rootScope, $stateParams, $scope, $state, ApiService, BaseState){
            console.log("[ProfileCtrl] userId:", $stateParams.userId);
            $scope.BaseState = BaseState;

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
        },
        controllerAs: "ProfileCtrl"
    })
    .state('author',{
        url: '/:authorId',
        templateUrl: './partials/author.html',
        controller: function ($stateParams, $scope, ApiService, BaseState){
            console.log("[authorCtrl] authorId:", $stateParams.authorId);
            const authorId = $stateParams.authorId;
            $scope.BaseState = BaseState;
            $scope.loadingQuotes = true;
            $scope.onSourceClick = (sourceId) => {
                console.log("[authorCtrl.onSourceClick] sourceId:",sourceId);
                _selectedSource = $scope.author.sources.find((s) => {return s._id === sourceId});
                console.log("[authorCtrl.onSourceClick] _selectedSource:", _selectedSource);
                BaseState.toSourceState(authorId, sourceId);
            };

            ApiService.getAuthor(authorId).then((resp) => {
                console.log("[authorCtrl.getAuthor] resp:",resp);
                resp.data.sources.map((item) => {
                    item.disp_lang = BaseState.displayLang(item.original_lang);
                });
                $scope.author = resp.data;
                _selectedAuthor = resp.data;
            });

            ApiService.getQuotesByAuthor(authorId).then((resp) => {
                $scope.unsourcedQuotes = resp.data;
                $scope.loadingQuotes = false;
            });
        },
        controllerAs: 'authorCtrl'
    })
    .state('source',{
        url: '/:authorId/:sourceId',
        templateUrl: './partials/source-quotes.html',
        controller: function ($stateParams, $scope, ApiService, BaseState){
            console.log("[sourceCtrl] _selectedAuthor:", _selectedAuthor,", _selectedSource:", _selectedSource);
            const sourceId = $stateParams.sourceId;
            const authorId = $stateParams.authorId;

            $scope.BaseState = BaseState;
            $scope.loading = true;
            $scope.quotes = null;
            $scope.author = _selectedAuthor || null;
            $scope.source = _selectedSource || null;

            if(!$scope.author || $scope.author.id !== authorId){
                ApiService.getAuthor(authorId).then((resp) => {
                    resp.data.sources.map((item) => {
                        item.disp_lang = BaseState.displayLang(item.original_lang);
                    });
                    $scope.author = resp.data;
                    $scope.source = $scope.author.sources.find((s) => {return s._id === sourceId});
                    _selectedAuthor = resp.data;
                    _selectedSource = $scope.source;
                });
            }
            ApiService.getQuotesBySource(sourceId).then((resp) => {
                $scope.quotes = resp.data;
                $scope.loading = false;
            });
        },
        controllerAs: 'sourceCtrl'
    });
})
.controller('AccessViewController', ['$rootScope', '$scope', '$state',function ($rootScope, $scope, $state){
    console.log("[AccessViewController]");
    $scope.signOut = function() {
        console.log("[AccessViewController.signOut]");
        $rootScope.userCredentials = null;
        $state.go("toppers");
    };
}])
.directive('qtbAccessView', function() {
  return {
    templateUrl: 'partials/acess-view.html'
  };
});;

angular.module('quotable').config(['$compileProvider', '$httpProvider', function ($compileProvider, $httpProvider) {
    // uncomment for production
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync( true );
}]);
