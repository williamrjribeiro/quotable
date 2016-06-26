/*@flow*/
import Utils from '../../crossenv/utils';

export default class ToppersCtrl{
    _$rootScope: Object;
    _ApiService: Object;
    _BaseStateCtrl: Object;
    loadingA: boolean;
    loadingB: boolean;
    loadingC: boolean;
    loadingD: boolean;
    knownAuthors: Array<Object>;
    knownSources: Array<Object>;
    unsourcedQuotes: Array<Object>;
    mysteriousQuotes: Array<Object>;
    constructor($rootScope: Object, ApiService: Object, BaseStateCtrl: Object){
        'ngInject';
        console.log("[ToppersCtrl]");
        this._$rootScope = $rootScope;
        this._ApiService = ApiService;
        this._BaseStateCtrl = BaseStateCtrl;

        this.loadingA = true;
        this.loadingB = true;
        this.loadingC = true;
        this.loadingD = true;

        // FIXME: For some reason it's needed to manually bind the async handlers...
        this._ApiService.mostLiked("authors").then(this._onMostLikedAuthors.bind(this));

        this._ApiService.mostLiked("sources").then(this._onMostLikedSources.bind(this));

        this._ApiService.mostLiked("unsourced").then(this._onMostLikedUnsourced.bind(this));

        this._ApiService.mostLiked().then(this._onMostLikedMysterious.bind(this));
    }

    _onMostLikedAuthors(resp : Object) : void {
        resp.data.map((item) => {
            item.name = Utils.camelCase(item._id);
        });
        this._doneLoading(this, "loadingA","knownAuthors", resp.data);
    }

    _onMostLikedSources(resp : Object) : void {
        resp.data.map((item) => {
            item.title = Utils.camelCase(item._id);
        });
        this._doneLoading(this, "loadingB","knownSources", resp.data);
    }

    _onMostLikedUnsourced(resp : Object) : void {
        let quotes = resp.data;
        quotes.map((item) => {
            item.author_name = Utils.camelCase(item.author_id);
        });
        // TODO: Refactor this to be more reusable and use it everywhere.
        if(this._$rootScope.userCredentials){
            this._ApiService.findUserLikes(this._$rootScope.userCredentials._id, quotes).then((foundLikes) => {
                this._doneLoading(this, "loadingC","unsourcedQuotes", quotes);
            })
        }
        else
            this._doneLoading(this, "loadingC","unsourcedQuotes", quotes);
    }

    _onMostLikedMysterious(resp : Object) : void {
        let quotes = resp.data;
        let vm = this;
        if(this._$rootScope.userCredentials){
            this._ApiService.findUserLikes(this._$rootScope.userCredentials._id, quotes).then((foundLikes) => {
                this._doneLoading(vm, "loadingD","mysteriousQuotes", quotes);
            })
        }
        else
            this._doneLoading(vm, "loadingD","mysteriousQuotes", quotes);
    }

    _doneLoading(obj:Object, loading:string, collection:string, data: Array<Object>) : void {
        console.log("[ToppersCtrl._doneLoading] loading: ", loading, ", collection: ", collection, ", data.length:", data.length);
        obj[loading] = false;
        obj[collection] = data;
    }
}
