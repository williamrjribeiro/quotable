/*@flow*/
export default class SignUpCtrl {
    _$rootScope: Object;
    _$state: Function;
    _ApiService: Object;
    constructor($rootScope: Object, $state: Function, ApiService: Object){
        console.log("[SignUpCtrl]");
        this._$rootScope = $rootScope;
        this._$state = $state;
        this._ApiService = ApiService;
    }

    addUser(user : Object) : void {
        console.log("[SignUpCtrl.addUser] user:", user);
        this._ApiService.addUser(user).then(this._onUserAdded.bind(this)).catch((err) => {
            console.warn("[SignUpCtrl.addUser] err:", err.toString());
        });
    }

    _onUserAdded(resp : Object) : void {
        console.log("[SignUpCtrl._onUserAdded] resp:", resp);
        this._$rootScope.userCredentials = resp.data.user;
        this._$rootScope.emit('USER_ADDED', resp.data.user);
        this._$state.go("profile", {userId: resp.data.user._id});
    }
}
