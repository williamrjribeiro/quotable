/* @flow */
import angular from 'angular';
import 'angular-ui-router';
import {Utils} from '../crossenv/utils';

angular.module('quotable', ['ui.router'] )
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
                quotes.map((item) => {
                    item.author_name = Utils.camelCase(item.author_id);
                });
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

            ApiService.getTotalLikes({what:"author",id: authorId}).then((resp) => {
                console.log("[authorCtrl.getTotalLikes] resp:",resp);
                $scope.author.totalLikes = resp.data[0] ? resp.data[0].total_likes : 0;
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

            ApiService.getTotalLikes({what:"source",id: sourceId}).then((resp) => {
                console.log("[authorCtrl.getTotalLikes] resp:",resp);
                $scope.source.totalLikes = resp.data[0] ? resp.data[0].total_likes : 0;
            });

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
    templateUrl: 'partials/acess-view.html',
    replace: true
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
                if(ctrl.hasLiked){
                    ctrl.hasLiked = false;
                    if(ctrl.val > 0)
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
            return "like" + (val !== 1 ? "s":"");
        }
    }
});

angular.module('quotable').config(['$compileProvider', '$httpProvider', ($compileProvider, $httpProvider) => {
    // uncomment for production
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync( true );
}]);
