import {Page} from "../Page";

export class License extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "License";
        this.cacheLevel = 0;

    }

    content() {
        // language=HTML
        return `license`;

    }

    onMount() {

    }

}
