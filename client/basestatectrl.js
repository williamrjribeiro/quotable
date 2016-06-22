/* @flow */
export default class BaseStateCtrl {
    constructor($state : Function , $rootScope : Object){
        'ngInject';
        console.log("[BaseStateCtrl] $state:", typeof $state,", $rootScope:", typeof $rootScope);
        this._$state = $state;
        this._$rootScope = $rootScope;

        // Keeps track of all loaded quotes that appear on the page.
        // Necessary for determining if signed in user has already liked it.
        this._$rootScope.loadedQuotes = new Set();

        // Every time the state changes, reset the loadedQuotes set.
        this._$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            //console.log("[BaseStateCtrl.stateChangeStart] toState: "+toState.name+", loadedQuotes.length: "+$rootScope.loadedQuotes.length);
            this._$rootScope.loadedQuotes = new Set();
        });
    }

    signOut() : void {
        console.log("[BaseStateCtrl.signOut] userCredentials:", this._$rootScope.userCredentials);
        this._$rootScope.userCredentials = null;
        this._$state.go("toppers");
    }

    toAuthorState(id: string): void{
        console.log("[BaseStateCtrl.toAuthorState] id:", id);
        this._$state.go('author', {authorId: id});
    }

    toSourceState(authorId: string, sourceId: string): void{
        console.log("[BaseStateCtrl.toSourceState] authorId:",authorId, ",sourceId", sourceId);
        this._$state.go('source', {authorId: authorId, sourceId: sourceId});
    }

    toQuotesState(id: string): void{
        console.log("[BaseStateCtrl.toQuotesState] id:", id);
        this._$state.go('author.source.quotes', {sourceId: id});
    }

    toProfileState(id: string): void{
        console.log("[BaseStateCtrl.toProfileState] id:", id);
        this._$state.go('profile', {userId: id});
    }

    displayLang(lang: string): string {
        console.log("[BaseStateCtrl.displayLang] lang:", lang);
        switch(lang){
            case "eng": return "English";
            default: return lang;
        }
    }
}
