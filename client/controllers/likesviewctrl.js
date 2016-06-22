/*@flow*/
export default class LikesViewCtrl {
    constructor($rootScope, ApiService){
        'ngInject';
        //console.log(`[LikesViewCtrl] val: ${this.val}, quoteId: ${this.quoteId}, hasLiked: ${this.hasLiked}`);
        this._$rootScope = $rootScope;
        this._ApiService = ApiService;

        this.signedIn = $rootScope.userCredentials ? true : false;
        this.likeLabel = this.updateLabel(this.val);
        this.likeToggle = this.hasLiked ? "Unlike" : "Like";
    }

    toggleLike() : void {
        console.log('[LikesController.toggleLike] quote_id:', this.quote_id,", hasLiked:", this.hasLiked);
        const action = this.hasLiked ? "unlike" : "like";
        this._ApiService
            .toggleLike(this.quoteId, this._$rootScope.userCredentials._id, action)
            .then(this._onToggleLike.bind(this));
    }

    updateLabel(val:number) : string{
        return "like" + (val !== 1 ? "s":"");
    }

    _onToggleLike(resp : Object) : void {
        console.log('[LikesController._onToggleLike] resp:', resp);
        if(this.hasLiked){
            this.hasLiked = false;
            if(this.val > 0)
                this.val--;
            this.likeToggle = "Like";
        }
        else {
            this.hasLiked = true;
            this.val++;
            this.likeToggle = "Unlike";
        }
        this.label = this.updateLabel(this.val);
    }
}
