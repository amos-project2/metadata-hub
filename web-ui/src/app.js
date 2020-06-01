import 'bootstrap';
import './scss/app.scss';
// import {Page} from "./Page";
import {Template} from "./template";
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";


// let graphQlFetcher =

let dependencies={
    graphQlFetcher:new GraphQlFetcher("graphql/"),
}

let template = new Template(dependencies);



template.injectinDomeAndRegisterListener($(".app-root"));
$("#nav-element-form-query").trigger("click");



