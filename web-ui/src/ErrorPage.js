import {Page} from "./Page";

export class ErrorPage extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "404-Error";
        this.cacheLevel = 0;
    }

    content() {
        return `The page is not found. 404`;

    }

    onMount() {

    }

    onUnMount() {

    }


    onLoad() {

    }

    onUnLoad() {

    }

}
