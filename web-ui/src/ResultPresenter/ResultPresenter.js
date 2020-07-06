export class ResultPresenter {

    static increaseCount() {
        this.count = this.getCount() + 1;
    }

    static getCount() {
        return this.count || 0;
    }

    constructor(graphQlFetcher) {
        ResultPresenter.increaseCount();
        this.id = "ResultPresenter-" + ResultPresenter.getCount();
        this.pSelector = $("#" + this.id);
        this.graphQlFetcher = graphQlFetcher;
    }


    getHtml() {

        // language=HTML
        return `
            <div id="${this.id}">
                <h4>Result:</h4>

                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" id="json-tab" data-toggle="tab" href="#json" role="tab" aria-controls="json" aria-selected="true">Json</a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link active" id="profile-tab" data-toggle="tab" href="#table" role="tab" aria-controls="table" aria-selected="false">Table</a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" id="contact-tab" data-toggle="tab" href="#export" role="tab" aria-controls="export" aria-selected="false">Export</a>
                      </li>
                    </ul>

                    <div class="tab-content" id="myTabContent">
                      <div class="tab-pane fade " id="json" role="tabpanel" aria-labelledby="json-tab">

                        <div>
                            <pre class="q_result"></pre>
                        </div>

                      </div>
                      <div class="tab-pane fade show active" id="table" role="tabpanel" aria-labelledby="table-tab">
                            ...
                      </div>
                      <div class="tab-pane fade" id="export" role="tabpanel" aria-labelledby="export-tab">
                            ...
                      </div>
                    </div>



            </div>`;

    }

    generateResultAndInjectIntoDom(query) {
        this.pSelector = $("#" + this.id);//it seems i have to reattach also the beginning of the selector, otherwise it wouldnt work
        let thisdata = this;
        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
            thisdata.pSelector.find(".q_result").text(jsonString);
        });
    }

}
