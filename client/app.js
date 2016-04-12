import angular from 'angular';
import 'angular-ui-router';
//import './ApiService';

angular.module('quotable', ['ui.router'] )
.provider('ApiService', function ApiServiceProvider(){
    this.$get = function($http){
        return {
            toppers: function(){
                console.log("[ApiService.toppers]");
                return $http.get('/api/toppers');
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

            $scope.toAuthorState = function(authorName){
                console.log("[toppers.toAuthorState] authorName:", authorName);
                $state.go('author', {authorName: authorName.toLowerCase().replace(" ","_")});
            };
            $scope.loading = true;
            ApiService.toppers().then((resp) => {
                $scope.loading = false;
                $scope.toppers = resp.data;
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
