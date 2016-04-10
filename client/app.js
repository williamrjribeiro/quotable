import angular from 'angular';
import 'angular-ui-router';

let data = [
    {
        text: "T1",
        authorName: "A1",
        source: "S1",
        picture: "url1.jpg",
        id: "1"
    },
    {
        text: "T2",
        authorName: "A2",
        source: "S2",
        picture: "url2.jpg",
        id: "2"
    },
    {
        text: "T3",
        authorName: "A3",
        source: "S3",
        picture: "url3.jpg",
        id: "3"
    }
];

angular.module('quotable',['ui.router'])
.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('/',{
        url: '/',
        template: '<ul><li ng-repeat="quote in mainCtrl.topQuotes" >{{quote}}</li></ul>',
        controller: function (){
            console.log("[mainCtrl]");
            this.topQuotes = data;
        },
        controllerAs: 'mainCtrl'
    })
    .state('author',{
        url: '/:authorName',
        template: '<h1>{{author.authorName}}</h1><h2>{{author.text}}</h2><a ui-sref="author.source({authorName: author.authorName, sourceTitle: author.source})">To {{author.source}}</a><div ui-view></div>',
        controller: function ($stateParams, $scope){
            console.log("[authorCtrl] authorName:", $stateParams.authorName);
            $scope.author = data.find((d,i) => {
                if(d.authorName === $stateParams.authorName)
                    return d;
            });
        },
        controllerAs: 'authorCtrl'
    })
    .state('author.source',{
        url: '/:sourceTitle',
        template: '<h1>{{source.source}}</h1><h2>{{source.text}}</h2><h3>{{source.authorName}}</h3><a ui-sref="author.source.quote({quoteId: source.id})">To quote {{source.text}}</a><div ui-view></div>',
        controller: function ($stateParams, $scope){
            console.log("[sourceCtrl] sourceTitle:", $stateParams.sourceTitle);
            $scope.source = data.find((d,i) => {
                if(d.authorName === $stateParams.authorName && d.source === $stateParams.sourceTitle)
                    return d;
            });
        },
        controllerAs: 'sourceCtrl'
    }).state('author.source.quote',{
        url: '/:quoteId',
        template: '<h1>"{{quote.text}}"',
        controller: function ($stateParams, $scope){
            console.log("[quoteCtrl] sourceTitle:", $stateParams.quoteId);
            $scope.quote = data.find((d,i) => {
                if(d.id === $stateParams.quoteId && d.authorName === $stateParams.authorName && d.source === $stateParams.sourceTitle)
                    return d;
            });
        },
        controllerAs: 'quoteCtrl'
    });
});
