import {Page} from "../Page";

export class About extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "About";
        this.cacheLevel = 0;

    }

    content() {
        // language=HTML
        return `about`;

    }

    onMount() {

    }

}
