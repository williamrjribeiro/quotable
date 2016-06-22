/*@flow*/
export default class AccessViewCtrl {
    constructor($rootScope, $state){
        'ngInject';
        console.log("[AccessViewCtrl]");
        this._$rootScope = $rootScope;
        this._$state = $state;
    }

    signOut() : void {
        console.log("[AccessViewController.signOut]");
        this._$rootScope.userCredentials = null;
        this._$state.go("toppers");
    }
}
