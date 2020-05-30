
import {Page} from "../Page";

export class ExamplePage extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "Example Page";
        //here you set the title-attribut
        //you can here also set the caching_behavour and much more
        //take a look in class Page
    }

    content() {
        return `nothing rigth now`;
        //here you can return back the html content which should be shown
    }

    onMount() {
        //here you can register event-listener
        //for example: $(".hallo").click(function() {alert("asdf");});
        //which alerts asdf each time you click on any html element with the class hallo

        //$("#hallo") this here would select not classes but one html-elemnt with id=hallo
    }

    onUnMount() {
        //often you dont need that method
    }

    onRegister() {
        //often you dont need that method
    }

    onFirstLoad() {
        //this method is called on the first-load
    }

    onLoad() {
        //this method is called on each load
    }

    onUnLoad() {
        //this method is called on each unload
    }

}
