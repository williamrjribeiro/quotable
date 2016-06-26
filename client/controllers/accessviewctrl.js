/*@flow*/
export default class AccessViewCtrl {
    _$rootScope: Object;
    _$state: Function;
    constructor($rootScope : Object, $state : Function){
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
