/* @flow */
import angular from 'angular';
import 'angular-ui-router';

angular.module('quotable', ['ui.router'] )
.provider('ApiService', function ApiServiceProvider(){
    this.$get = function($http){
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
            geAuthor(authorId) {
                console.log("[ApiService.geAuthor] authorId:",authorId);
                return $http.get(`/api/authors/${authorId}`);
            }
        };
    };
})
.provider('BaseStateCtrl', function BaseStateCtrlProvider(){
    this.$get = function($state){
        return {
            sanitizeId(id){
                const sanitized = id.toLowerCase().replace(/ /g,"_");
                console.log("[BaseStateCtrl.sanitizeId] id:", id,", sanitized:", sanitized);
                return sanitized;
            },
            toSourceState(id){
                const sanitized = this.sanitizeId(id);
                console.log("[BaseStateCtrl.toSourceState] sanitized:", sanitized);
                $state.go('author.source', {sourceTitle: sanitized});
            },
            toAuthorState(id){
                const sanitized = this.sanitizeId(id);
                console.log("[BaseStateCtrl.toSourceState] sanitized:", sanitized);
                $state.go('author', {authorName: sanitized});
            },
            displayLang(lang) {
                console.log("[BaseStateCtrl.displayLang] lang:", lang);
                switch(lang){
                    case "eng": return "English";
                    default: return lang;
                }
            }
        }
    };
})
.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('toppers');

    $stateProvider.state('toppers',{
        url: '/',
        templateUrl: './partials/toppers.html',
        controller: function ($scope, $state, ApiService, BaseStateCtrl){
            console.log("[toppers.controller]");

            $scope.BaseStateCtrl = BaseStateCtrl;
            $scope.loadingA = true;
            $scope.loadingB = true;
            $scope.loadingC = true;
            $scope.loadingD = true;

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
        templateUrl: './partials/author.html',
        controller: function ($stateParams, $scope, ApiService, BaseStateCtrl){
            console.log("[authorCtrl] authorName:", $stateParams.authorName);

            $scope.BaseStateCtrl = BaseStateCtrl;

            ApiService.geAuthor($stateParams.authorName).then((resp) => {
                resp.data.sources.map((item) => {
                    item.disp_lang = BaseStateCtrl.displayLang(item.original_lang);
                });
                $scope.author = resp.data;
            });
        },
        controllerAs: 'authorCtrl'
    })
    .state('author.source',{
        url: '/:sourceTitle',
        template: '<h1>HELLO</h1>',
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
