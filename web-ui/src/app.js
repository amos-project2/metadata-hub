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

let jqueryMountPoint=$(".app-root");

let login = new LoginPage(jqueryMountPoint);
login.loadPage();

// let template = new Template(dependencies);
//
//
// template.injectinDomeAndRegisterListener(jqueryMountPoint);
// template.goToPage(utilities.getUrlParam("p","form-query"));




