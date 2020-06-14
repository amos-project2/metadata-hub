import 'bootstrap';
import whitestyle from './scss/dark/white.lazy.scss3';
import darkstyle from './scss/dark/dark.lazy.scss3';
import './scss/app.scss';
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";
import {RestAPIFetcher} from "./buisnesslogic/RestAPIFetcher";
import {Utilities} from "./buisnesslogic/Utilities";


import {LoginPage} from "./login/LoginPage";

whitestyle.use();

let utilities = new Utilities()

let dependencies = {
    graphQlFetcher: new GraphQlFetcher("graphql/"),
    restApiFetcherServer: new RestAPIFetcher("api/"),
    restApiFetcherCrawler: new RestAPIFetcher("crawlerapi/"),
    utilities: utilities,

}

let styles = {
    white: whitestyle,
    dark: darkstyle,
}


let jqueryMountPoint = $(".app-root");


let login = new LoginPage(dependencies, jqueryMountPoint, styles);
login.loadPage();









