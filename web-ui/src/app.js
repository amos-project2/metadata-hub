import 'bootstrap';
import './scss/app.scss';
// import {Page} from "./Page";
import {Template} from "./template";




let template = new Template();
template.injectinDomeAndRegisterListener($(".app-root"));
$("#nav-element-graphql-query").trigger("click");



