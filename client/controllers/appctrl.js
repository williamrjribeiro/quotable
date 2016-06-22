/*@flow*/
export default class AppCtrl{
    constructor($rootScope){
        'ngInject';
        console.log("[AppCtrl]");
        this._$rootScope = $rootScope;

        this._$rootScope.on('USER_ADDED', this.onUserAdded.bind(this));
    }

    onUserAdded(user : Object) : void {
        console.log("[AppCtrl.onUserAdded] user:", user);
    }
}
