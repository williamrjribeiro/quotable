/*@flow*/
export default class ProfileCtrl {
    constructor($rootScope, $stateParams, ApiService, BaseStateCtrl){
        'ngInject';
        console.log("[ProfileCtrl]");
        this._$rootScope = $rootScope;
        this._BaseStateCtrl = BaseStateCtrl;

        this.user = {};
        const userId = $stateParams.userId;

        if($rootScope.selectedUser && $rootScope.selectedUser._id === userId)
            this.user = $rootScope.selectedUser;
        else
            ApiService.getUser(userId).then(this._onUser.bind(this)).catch(this._onError);

        this.loadingContribs = true;
        //ApiService.getContributionsByUser(userId).then(this._onContributions.bind(this)).catch(this._onError);
        ApiService.getContributionsByUser(userId).then(this._onLoaded.bind(this,'loadingContribs','contributions')).catch(this._onError);

        this.loadingLikes = true;
        //ApiService.getUserLikes(userId).then(this._onUserLikes.bind(this)).catch(this._onError);
        ApiService.getUserLikes(userId).then(this._onLoaded.bind(this,'loadingLikes','userLikes')).catch(this._onError);
    }

    _onUser(resp : Object) : void {
        console.log("[ProfileCtrl._onUser] data:", resp.data);
        this.user = resp.data;
        this._$rootScope.selectedUser = resp.data;
    }

    _onLoaded(propFlag : string, propLoaded : string, resp : Object) : void {
        console.log(`[ProfileCtrl._onLoaded] propFlag: ${propFlag}, propLoaded: ${propLoaded}, data.legth: ${resp.data.length}`);
        this[propLoaded] = resp.data;
        if(propFlag)
            this[propFlag] = false;
    }

    _onError(err : Object) : void {
        console.warn("[ProfileCtrl._onError] err:", err.toString());
    }
}
