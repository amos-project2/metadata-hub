import {Page} from "../Page";

export class About extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "About";
        this.cacheLevel = 0;

    }

    content() {
        // language=HTML
        return `
            <div class="text-center">
                <img src="logo.png" alt="Metadata-Hub" style="width:400px">
            </div>

            <p class="text-center">

                <b>Version: 1.0.0</b><br><br>

                <b><a href="https://github.com/amos-project2/metadata-hub/" target="_blank">Code on Github</a></b><br><br>

                <b>Authors:</b><br>
                Gregor Fendt<br>
                Benjamin Fischer<br>
                Thomas Wolter<br>
                Robin Kreuzer<br>
                Ngoc Khang Nguyen<br>

            </p>

        `;

    }

    onMount() {

    }

}
