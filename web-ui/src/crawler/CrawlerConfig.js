
import {Page} from "../Page";

export class CrawlerConfig extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Crawler Config";
        this.cacheLevel=0;

    }

    content() {
        return `

    only for developer presentation purposes, the crawler must run to see here something...

       <div class="embed-responsive" style="height:calc(100vh - 150px);">
             <iframe class="embed-responsive-item" src="/crawlerui/config" style="height: 100%;"></iframe>


        `;

    }

    onMount() {

    }

    onUnMount() {

    }

    onRegister() {

    }

}
