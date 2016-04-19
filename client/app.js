/* @flow */
import angular from 'angular';
import 'angular-ui-router';

angular.module('quotable', ['ui.router'] )
.provider('ApiService', function ApiServiceProvider(){
    this.$get = function($http){
        return {
            mostLiked: function(collectionName="mysterious",limit=3){
                console.log("[ApiService.mostLiked]");
                /* Most Liked URL Pattern
                   /api/mostLiked/authors
                   /api/mostLiked/sources
                   /api/mostLiked/unsourced
                   /api/mostLiked/unauthored
                   /api/mostLiked/
                */
                return $http.get(`/api/mostLiked/${collectionName}?limit=${limit}`);
            }
        };
    };
})
.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('toppers');

    $stateProvider.state('toppers',{
        url: '/',
        templateUrl: './partials/toppers.html',
        controller: function ($scope, $state, ApiService){
            console.log("[toppers.controller]");

            $scope.loadingA = true;
            $scope.loadingB = true;
            $scope.loadingC = true;
            $scope.loadingD = true;

            $scope.toAuthorState = function(authorId){
                console.log("[toppers.toAuthorState] authorId:", authorId);
                $state.go('author', {authorName: authorId.toLowerCase().replace(" ","_")});
            };

            $scope.toSourceState = function(sourceId){
                console.log("[toppers.toSourceState] sourceId:", sourceId);
                $state.go('author.source', {sourceTitle: sourceId.toLowerCase().replace(" ","_")});
            };

            ApiService.mostLiked("authors").then((resp) => {
                $scope.loadingA = false;
                $scope.knownAuthors = resp.data;
            });

            ApiService.mostLiked("sources").then((resp) => {
                $scope.loadingB = false;
                $scope.knownSources = resp.data;
            });

            ApiService.mostLiked("unsourced").then((resp) => {
                $scope.loadingC = false;
                $scope.unsourcedQuotes = resp.data;
            });

            ApiService.mostLiked().then((resp) => {
                $scope.loadingD = false;
                $scope.mysteriousQuotes = resp.data;
            });
        }
    })
    .state('author',{
        url: '/:authorName',
        template: '<h1>{{author.authorName}}</h1><h2>{{author.text}}</h2><a ui-sref="author.source({sourceTitle: author.source})">To {{author.source}}</a><div ui-view></div>',
        controller: function ($stateParams, $scope, ApiService){
            console.log("[authorCtrl] authorName:", $stateParams.authorName);
            $scope.author = null;
        },
        controllerAs: 'authorCtrl'
    })
    .state('author.source',{
        url: '/:sourceTitle',
        template: '<h1>{{source.source}}</h1><h2>{{source.text}}</h2><h3>{{source.authorName}}</h3><a ui-sref="author.source.quote({quoteId: source.id})">To quote {{source.text}}</a><div ui-view></div>',
        controller: function ($stateParams, $scope, ApiService){
            console.log("[sourceCtrl] sourceTitle:", $stateParams.sourceTitle);
            $scope.source = null;
        },
        controllerAs: 'sourceCtrl'
    }).state('author.source.quote',{
        url: '/:quoteId',
        template: '<h1>"{{quote.text}}"',
        controller: function ($stateParams, $scope, ApiService){
            console.log("[quoteCtrl] sourceTitle:", $stateParams.quoteId);
            $scope.quote = null;
        },
        controllerAs: 'quoteCtrl'
    });
});
