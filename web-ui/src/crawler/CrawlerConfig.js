
import {Page} from "../Page";

export class CrawlerConfig extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "Crawler Config";

    }

    content() {
        return `
       <div class="embed-responsive" style="height:calc(100vh - 150px);">
             <iframe class="embed-responsive-item" src="http://localhost:9000/config/" style="height: 100%;"></iframe>


        `;

    }

    onMount() {

    }

    onUnMount() {

    }

    onRegister() {

    }

}
