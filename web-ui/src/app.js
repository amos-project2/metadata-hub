import 'bootstrap';
import './scss/app.scss';
import {Template} from "./template";
import {GraphQlFetcher} from "./buisnesslogic/GraphQlFetcher";



let dependencies = {
    graphQlFetcher: new GraphQlFetcher("graphql/"),
}

let template = new Template(dependencies);


template.injectinDomeAndRegisterListener($(".app-root"));
$("#nav-element-form-query").trigger("click");



