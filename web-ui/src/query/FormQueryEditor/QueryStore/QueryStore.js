import {Page} from "../../../Page";
import {StoreService} from "./StoreService";

export class QueryStore extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Query Store";
        this.cacheLevel = 3;
        //use 0 for no caching (the dom for this page will be deleted and onMound/onUnMount is called each enter and leaving the page here)
        //use 3 for complete caching(the dome for this page stay after leaving
        //     (its only hidden, be careful, of using html-classes/ids in more areas of the whole webpage, that they dont overlap))
        //     onMount is only called at the first time, unOnLoad-never (except if you use the delete-cache-method)
        //     i think using 3 here is a good idea, so the user can work on a formular go to other page and go back to work on
        //     the dynamic stuff in the page is handled by javascript, timers who reload parts for page in a specific way for specific page-components


        //here you set the title-attribut
        //you can here also set the caching_behavour and much more
        //take a look in class Page

        this.StoreService = new StoreService();

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
