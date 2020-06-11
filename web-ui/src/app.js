import 'bootstrap';
import './scss/app.scss';
import {Template} from "./template";
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";
import {RestAPIFetcher} from "./buisnesslogic/RestAPIFetcher";



let dependencies = {
    graphQlFetcher: new GraphQlFetcher("graphql/"),
    restApiFetcherServer: new RestAPIFetcher("api/"),
    restApiFetcherCrawler: new RestAPIFetcher("crawlerapi/"),

}

let template = new Template(dependencies);


template.injectinDomeAndRegisterListener($(".app-root"));
$("#nav-element-form-query").trigger("click");



