/*@flow*/
export default class AuthorCtrl {
    constructor($rootScope, $stateParams, ApiService, BaseStateCtrl){
        'ngInject';
        console.log("[AuthorCtrl]");
        this._$rootScope = $rootScope;
        this._BaseStateCtrl = BaseStateCtrl;
        this._ApiService = ApiService;

        this.authorId = $stateParams.authorId;

        this.loadingQuotes = true;

        ApiService.getAuthor(this.authorId).then(this._onAuthor.bind(this));

        ApiService.getTotalLikes({what:"author",id: this.authorId}).then(this._onTotalLikes.bind(this));

        ApiService.getQuotesByAuthor(this.authorId).then(this._onQuotesByAuthor.bind(this));
    }

    onSourceClick(sourceId : string) : void {
        console.log("[AuthorCtrl.onSourceClick] sourceId:",sourceId);
        let selectedSource = this.author.sources.find((s) => {return s._id === sourceId});
        console.log("[AuthorCtrl.onSourceClick] _selectedSource:", selectedSource);
        this._BaseStateCtrl.toSourceState(this.authorId, sourceId);
    }

    _onAuthor(resp : Object) : void {
        console.log("[AuthorCtrl._onAuthor] resp:",resp);
        resp.data.sources.map((item) => {
            item.disp_lang = this._BaseStateCtrl.displayLang(item.original_lang);
        });
        this.author = resp.data;
        this._$rootScope.selectedAuthor = resp.data;
    }

    _onTotalLikes(resp : Object) : void {
        console.log("[AuthorCtrl._onTotalLikes] resp:",resp);
        this.author.totalLikes = resp.data[0] ? resp.data[0].total_likes : 0;
    }

    _onQuotesByAuthor(resp : Object) : void {
        console.log("[AuthorCtrl._onQuotesByAuthor] data.length:",resp.data.length);
        let quotes = resp.data;
        if(this._$rootScope.userCredentials)
            this._ApiService.findUserLikes(this._$rootScope.userCredentials._id, quotes).then(this._onUserLikes.bind(this));
        else
            this._onUserLikes(resp);
    }

    _onUserLikes(resp : Object) : void {
        console.log("[AuthorCtrl._onUserLikes] data.length:",resp.data);
        this.unsourcedQuotes = resp.data;
        this.loadingQuotes = false;
    }
}
