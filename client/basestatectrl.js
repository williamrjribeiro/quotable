/* @flow */
import angular from 'angular';
angular.module('quotable')
.factory('BaseStateCtrl', ['$state','$q','$rootScope', function BaseStateCtrlFactory($state, $q, $rootScope){

    // Keeps track of all loaded quotes that appear on the page.
    // Necessary for determining if signed in user has already liked it.
    $rootScope.loadedQuotes = new Set();

    // Every time the state changes, reset the loadedQuotes set.
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        //console.log("[BaseStateCtrl.stateChangeStart] toState: "+toState.name+", loadedQuotes.length: "+$rootScope.loadedQuotes.length);
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
}]);
