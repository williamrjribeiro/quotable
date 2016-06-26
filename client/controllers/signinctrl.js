/*@flow*/
export default class SignInCtrl {
    _$rootScope: Object;
    _$state: Function;
    _ApiService: Object;
    credentials: Object;
    constructor($rootScope: Object, $state: Function, ApiService: Object){
        'ngInject';
        console.log("[SignInCtrl]");
        this._$rootScope = $rootScope;
        this._$state = $state;
        this._ApiService = ApiService;
        this.credentials = {};
    }

    verifyCredentials(credentials : Object) : void {
        console.log("[SignInCtrl.verifyCredentials]");
        this._ApiService.verifyCredentials(credentials).then(this._onCredentials.bind(this)).catch((err) => {
            console.warn("[SignInCtrl.verifyCredentials] err:", err.toString());
        });
    }

    _onCredentials(resp: Object) : void {
        console.log("[SignInCtrl._onCredentials] data:", resp.data);
        this._$rootScope.userCredentials = resp.data.user;
        this._$rootScope.selectedUser = resp.data.user;
        this._$state.go("profile", {userId: resp.data.user._id});
    }
}
