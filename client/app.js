/* @flow */
import angular from 'angular';
import 'angular-ui-router';
import {Utils} from '../crossenv/utils';

angular.module('quotable', ['ui.router'] )
.factory('ApiService', ['$http', function ApiServiceFactory($http){
    return {
        mostLiked (collectionName="mysterious",limit=3){
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
        getAuthor(authorId){
            console.log("[ApiService.getAuthor] authorId:",authorId);
            return $http.get(`/api/authors/${authorId}`);
        },
        getQuotesBySource(sourceId, limit=20){
            console.log("[ApiService.getQuotesBySource] sourceId:",sourceId);
            return $http.get(`/api/sources/${sourceId}/quotes?limit=${limit}`);
        },
        getQuotesByAuthor(authorId, limit=20){
            console.log("[ApiService.getQuotesByAuthor] authorId:",authorId);
            return $http.get(`/api/authors/${authorId}/quotes?limit=${limit}`);
        },
        addUser(user){
            console.log("[ApiService.addUser] user.id:",user.id);
            return $http.post(`/api/signup`, user);
        }
    };
}])
.factory('BaseState', ['$state', function BaseStateFactory($state){
    return {
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
        controller: function ($stateParams, $scope, $http, $state, ApiService){
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
});

angular.module('quotable').config(['$compileProvider', '$httpProvider', function ($compileProvider, $httpProvider) {
    // uncomment for production
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync( true );
}]);
