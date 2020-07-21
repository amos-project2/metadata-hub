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
            <button class="btn btn-lg btn-primary btn-block logout-action-button2" type="button">Logout and clear the GraphiQl-History</button>
            <button class="btn btn-lg btn-primary btn-block logout-action-button3" type="button">Logout and clear the GraphiQl-History and your name</button>
        `;

    }

    onMount() {

        $(".logout-action-button1").click(function () {
            localStorage.removeItem('logged_in');
            window.location.href='/';
        });

        $(".logout-action-button2").click(function () {
            let darkmode=localStorage.getItem("darkmode");
            let username=localStorage.getItem("username");

            localStorage.clear();

            localStorage.setItem("username",username);
            localStorage.setItem("darkmode", darkmode);
            window.location.href='/';
        });

        $(".logout-action-button3").click(function () {
            //delete all is here ok
            localStorage.clear();
            window.location.href='/';
        });
    }


}
