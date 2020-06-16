import 'bootstrap';
import darkstyle from './scss/dark/dark.lazy.scss3';
import './scss/app.scss';
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";
import {RestAPIFetcher} from "./buisnesslogic/RestAPIFetcher";
import {Utilities} from "./buisnesslogic/Utilities";
import {LoginPage} from "./login/LoginPage";


if (window.myApplication === undefined) {
    alert("The start-html-page must define window.myApplication{}. It is missing. The pageload is abborted");
} else {
    let utilities = new Utilities();

    let dependencies = {
        graphQlFetcher: new GraphQlFetcher("graphql/"),
        restApiFetcherServer: new RestAPIFetcher("api/"),
        restApiFetcherCrawler: new RestAPIFetcher("crawlerapi/"),
        utilities: utilities,
        styles: {
            dark: darkstyle,
        }

    }

    let jqueryMountPoint = $(".app-root");


    let login = new LoginPage(dependencies, jqueryMountPoint);
    login.loadPage();
}








