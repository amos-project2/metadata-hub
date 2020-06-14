import {Page} from "../Page";

export class Logout extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Logout";
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
        this.cacheLevel = 0;

    }

    content() {
        // language=HTML
        return `
            <button class="btn btn-lg btn-primary btn-block logout-action-button1" type="button">Logout</button>
            <button class="btn btn-lg btn-primary btn-block logout-action-button2" type="button">Logout with clearing the GraphiQl-History</button>
            <button class="btn btn-lg btn-primary btn-block logout-action-button2" type="button">Logout with clearing the GraphiQl-History and Your-Name</button>
        `;

    }

    onMount() {

        $(".logout-action-button1").click(function () {
            localStorage.removeItem('logged_in');
            window.location.href='/';
        });

        $(".logout-action-button2").click(function () {
            localStorage.clear();
            window.location.href='/';
        });

    }

    onUnMount() {


    }


    onLoad() {

    }

    onUnLoad() {

    }

}