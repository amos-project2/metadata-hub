import {Page} from "../Page";

export class Testname extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "Testname-Title";
    }

    content() {
        return `<div class="my-test-class-element" style="font-size: 20px; color:blue;">hey this is the specific testname-content</div>`;
    }

    onMount() {
        $(".my-test-class-element").click(function () {
            alert("hey!");
        });
    }

}
