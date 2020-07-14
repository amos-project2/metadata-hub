import {Page} from "../../../Page";
import {StoreService} from "./StoreService";

export class QueryStore extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Query Store";
        this.cacheLevel = 3;
        this.storeService = null;

    }

    setStoreService(storeService) {
        this.storeService=storeService
    }

    content() {
        return `nothing rigth now`;
        //here you can return back the html content which should be shown
    }

    onMount() {

        //its called at caching-level=3 once, and never again (except you call the clearCache-method)
        //its called at caching-level=0 each time you enter the page and before onLoad-method is called

        //here you can register event-listener
        //for example: $(".hallo").click(function() {alert("asdf");});
        //which alerts asdf each time you click on any html element with the class hallo

        //$("#hallo") this here would select not classes but one html-elemnt with id=hallo
    }

    onUnMount() {

        //its called at caching-level=3 never(except you call the clearCache-method)
        //its called at caching-level=0 each time you leave the page and after onUnLoad-method is called

        //often you dont need that method, not in both cases i mentioned here
    }

    onRegister() {
        //this method is called at the time (and only one time) the whole webapplication is started
        //often you dont need that method
    }

    onFirstLoad() {
        //this method is called on the first-load, while onLoad is called on each load

        //note:
        //this method could be interessting, if caching-level is 0 and you want to have to run any only one time
        //and not on each onMount-Time (at caching-level=0)
    }

    onLoad() {
        //this method is called on each load of the page-section here
    }

    onUnLoad() {
        //this method is called on each unload of the page-section here
    }

}
