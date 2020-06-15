import {Page} from "../Page";

export class CrawlerInfo extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Crawler Info";
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
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
    }

    content() {

        // language=HTML

        let thisdata=this;

        return `
            Result in Json from Webcrawler:<br>
            <div class="ci-result">
            </div>

            <div>
<!--                <form onsubmit="()=>this.blub(event)">-->
<!--                    <input type="text" />-->
<!--                    <button type="submit"></button>-->

<!--                </form>-->


            </div>



        `;

    }

    blub(event) {
        event.preventDefault();
        alert("hi");

    }

    onMount() {



    }

    onUnMount() {


    }


    onFirstLoad() {

    }

    onLoad() {

        this.restAPIFetcherCrawler.fetchGet("info?test=bla&btest2=blub", function (event) {
            console.log(event)
            $(".ci-result").append(event.status);
            $(".ci-result").append(event.errorMessage);
            $(".ci-result").append("<pre>"+JSON.stringify(event.data, undefined, 2)+"</pre>");
        });

    }

    onUnLoad() {

    }

}
