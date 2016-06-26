/* @flow */
import angular from 'angular';
import 'angular-ui-router';
import ApiService from './apiservice.js';
import BaseStateCtrl from './controllers/basestatectrl.js';
import AppCtrl from './controllers/appctrl.js';
import ToppersCtrl from './controllers/toppersctrl.js';
import SignUpCtrl from './controllers/signupctrl.js';
import SignInCtrl from './controllers/signinctrl.js';
import ProfileCtrl from './controllers/profilectrl.js';
import AuthorCtrl from './controllers/authorctrl.js';
import SourceCtrl from './controllers/sourcectrl.js';
import AccessViewCtrl from './controllers/accessviewctrl.js';
import LikesViewCtrl from './controllers/likesviewctrl.js';
import Utils from '../crossenv/utils.js';

angular.module('quotable', ['ui.router'] )
.service('ApiService', ApiService)
.service('BaseStateCtrl', BaseStateCtrl)
.controller('AppCtrl', AppCtrl)
.controller('ToppersCtrl', ToppersCtrl)
.controller('SignUpCtrl', SignUpCtrl)
.controller('SignInCtrl', SignInCtrl)
.controller('ProfileCtrl', ProfileCtrl)
.controller('AuthorCtrl', AuthorCtrl)
.controller('SourceCtrl', SourceCtrl)
.controller('AccessViewCtrl', AccessViewCtrl)
.controller('LikesViewCtrl', LikesViewCtrl)
.config(($stateProvider, $urlRouterProvider, $compileProvider, $httpProvider) => {
    'ngInject';
    console.log("[quotable.config] dependencies injected?:", !( !$stateProvider && !$urlRouterProvider));
    let _selectedUser = null;
    let _selectedAuthor = null;
    let _selectedSource = null;

    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync( true );

    $urlRouterProvider.when("/", "toppers");
    $urlRouterProvider.otherwise('toppers');

    $stateProvider.state('toppers',{
        url: '/toppers',
        templateUrl: './partials/toppers.html',
        controller: 'ToppersCtrl as ctrl'
    })
    .state("/signup", {
        url:"/signup",
        templateUrl: "./partials/signup.html",
        controller: 'SignUpCtrl as ctrl'
    })
    .state("/signin", {
        url:"/signin",
        templateUrl: "./partials/signin.html",
        controller: 'SignInCtrl as ctrl'
    })
    .state("profile", {
        url:"/users/:userId",
        templateUrl: "./partials/profile.html",
        controller: 'ProfileCtrl as ctrl'
    })
    .state('author',{
        url: '/:authorId',
        templateUrl: './partials/author.html',
        controller: 'AuthorCtrl as ctrl'
    })
    .state('source',{
        url: '/:authorId/:sourceId',
        templateUrl: './partials/source-quotes.html',
        controller: 'SourceCtrl as ctrl'
    });
})
.directive('qtbAccessView', () => {
    return {
        templateUrl: 'partials/acess-view.html',
        replace: true
    }
})
.component('qtbLikes', {
    templateUrl: 'partials/likes.html',
    bindings: {
        val: '<',
        quoteId: '<',
        hasLiked: '<'
    },
    controller: 'LikesViewCtrl as ctrl'
});
