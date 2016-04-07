import angular from 'angular';
import 'angular-ui-router';

angular.module('quotable',['ui.router'])
.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('/',{
        url: ':authorName',
        template: '<ul><li ng-repeat="quote in mainCtrl.topQuotes" >{{quote}}</li></ul>',
        controller: function ($stateParams){
            console.log("[mainCtrl] authorName:", $stateParams.authorName);
            this.topQuotes = [
                {
                    text: "Text 1",
                    authorName: "Author Name 1",
                    source: "Source 1",
                    picture: "url1.jpg"
                },
                {
                    text: "Text 2",
                    authorName: "Author Name 2",
                    source: "Source 2",
                    picture: "url2.jpg"
                },
                {
                    text: "Text 3",
                    authorName: "Author Name 3",
                    source: "Source 3",
                    picture: "url3.jpg"
                }
            ];
        },
        controllerAs: 'mainCtrl'
    });
});
