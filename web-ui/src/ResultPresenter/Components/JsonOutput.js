export class JsonOutput {


    constructor() {

    }

    getMainHtmlCode() {
        return `
            <div>
                <pre class="q_result"></pre>
            </div>`;
    }

    onMount(pSelector) {
        this.pSelector=pSelector;

    }

    updateText(jsonString) {
        this.pSelector.find(".q_result").text(jsonString);
    }

}
