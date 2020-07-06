import 'bootstrap';
import darkstyle from './scss/dark/dark.lazy.scss3';
import './scss/app.scss';
import {GraphQlFetcher} from "./libs/Fetcher/GraphQlFetcher";
import {RestAPIFetcher} from "./libs/Fetcher/RestAPIFetcher";
import {Utilities} from "./Utilities/Utilities";
import {Login} from "./login/Login";
import {InputFieldMultiplier} from "./Utilities/InputFieldMultiplier";




if (window.myApplication === undefined) {
    alert("The start-html-page must define window.myApplication{}. It is missing. The pageload is abborted");
} else {
    let utilities = new Utilities();

    let dependencies = {
        graphQlFetcher: new GraphQlFetcher(window.myApplication.graphQLApi),
        restApiFetcherServer: new RestAPIFetcher(window.myApplication.serverApi),
        restApiFetcherCrawler: new RestAPIFetcher(window.myApplication.crawlerApi),
        utilities: utilities,
        config: window.myApplication,
        styles: {
            dark: darkstyle,
        }

    }

    let jqueryMountPoint = $(".app-root");


    let login = new Login(dependencies, jqueryMountPoint);
    login.loadPage();
}








