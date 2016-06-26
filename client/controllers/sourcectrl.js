/*@flow*/
export default class SourceCtrl {
    _$rootScope: Object;
    _$stateParams: Object;
    _ApiService: Object;
    _BaseStateCtrl: Object;
    loading: boolean;
    quotes: Array<Object>;
    author: Object;
    source: Object;
    constructor($rootScope : Object, $stateParams : Object, ApiService: Object, BaseStateCtrl: Object){
        'ngInject';
        console.log("[SourceCtrl]");
        this._$rootScope = $rootScope;
        this._BaseStateCtrl = BaseStateCtrl;
        this._ApiService = ApiService;

        const sourceId = $stateParams.sourceId;
        const authorId = $stateParams.authorId;

        this.loading = true;
        this.quotes = [];
        this.author = $rootScope.selectedAuthor || null;
        this.source = $rootScope.selectedSource || null;

        if(!this.author || this.author.id !== authorId){
            ApiService.getAuthor(authorId).then(this._onAuthor.bind(this, sourceId));
        }

        ApiService.getTotalLikes({what:"source",id: sourceId}).then(this._onTotalLikes.bind(this));

        ApiService.getQuotesBySource(sourceId).then(this._onQuotesBySource.bind(this));
    }

    _onAuthor(sourceId : string, resp : Object) : void {
        console.log("[SourceCtrl._onAuthor] resp:",resp);
        resp.data.sources.map((item) => {
            item.disp_lang = this._BaseStateCtrl.displayLang(item.original_lang);
        });

        this.author = resp.data;
        this.source = resp.data.sources.find((s) => {return s._id === sourceId});

        this._$rootScope.selectedAuthor = resp.data;
        this._$rootScope.selectedSource = this.source;
    }

    _onTotalLikes(resp : Object) : void {
        console.log("[SourceCtrl._onTotalLikes] resp:",resp);
        this.source.totalLikes = resp.data[0] ? resp.data[0].total_likes : 0;
    }

    _onQuotesBySource(resp : Object) : void {
        console.log("[SourceCtrl._onQuotesBySource] data.length:",resp.data.length);
        let quotes = resp.data;
        if(this._$rootScope.userCredentials)
            this._ApiService.findUserLikes(this._$rootScope.userCredentials._id, quotes).then(this._onUserLikes.bind(this));
        else
            this._onUserLikes(quotes);
    }

    _onUserLikes(data : Array<Object>) : void {
        console.log("[SourceCtrl._onUserLikes] data.length:",data.length);
        this.quotes = data;
        this.loading = false;
    }
}
