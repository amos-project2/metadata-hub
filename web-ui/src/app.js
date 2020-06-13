import 'bootstrap';
import './scss/app.scss';
import {Template} from "./template";
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";
import {RestAPIFetcher} from "./buisnesslogic/RestAPIFetcher";
import {Utilities} from "./buisnesslogic/Utilities";


import {LoginPage} from "./login/LoginPage";



let utilities = new Utilities()

let dependencies = {
    graphQlFetcher: new GraphQlFetcher("graphql/"),
    restApiFetcherServer: new RestAPIFetcher("api/"),
    restApiFetcherCrawler: new RestAPIFetcher("crawlerapi/"),
    utilities: utilities,

}
let template = new Template(dependencies);
let jqueryMountPoint=$(".app-root");


let login = new LoginPage(template, utilities, jqueryMountPoint);
login.loadPage();









