export class ResultPresenterSimple {

    static increaseCount() {
        this.count = this.getCount() + 1;
    }

    static getCount() {
        return this.count || 0;
    }

    constructor(graphQlFetcher) {
        ResultPresenterSimple.increaseCount();
        this.id = "ResultPresenterSimple-" + ResultPresenterSimple.getCount();
        this.pSelector = $("#" + this.id);
        this.graphQlFetcher = graphQlFetcher;
    }


    getHtml() {

        // language=HTML
        return `
            <div id="${this.id}">
                <h4>Result:</h4>
                <div>
                    <pre class="q_result"></pre>
                </div>
            </div>`;

    }

    generateResultAndInjectIntoDom(query) {
        this.pSelector = $("#" + this.id);
        let thisdata = this;
        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
            thisdata.pSelector.find(".q_result").text(jsonString);
        });
    }

}
