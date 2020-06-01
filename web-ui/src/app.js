import 'bootstrap';
import './scss/app.scss';
// import {Page} from "./Page";
import {Template} from "./template";
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";


let graphQlFetcher =new GraphQlFetcher("graphql/");

let template = new Template(graphQlFetcher);



template.injectinDomeAndRegisterListener($(".app-root"));
$("#nav-element-form-query").trigger("click");



