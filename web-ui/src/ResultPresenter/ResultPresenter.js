import {JsonOutput} from "./Components/JsonOutput";
import {TableOutput} from "./Components/TableOutput";
import {ExportOutput} from "./Components/ExportOutput";

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

        this.jsonOutput = new JsonOutput();
        this.tableOutput = new TableOutput();
        this.exportOutput = new ExportOutput();

    }

    onMount() {

        this.pSelector = $("#" + this.id);

        this.jsonOutput.onMount(this.pSelector);
        this.tableOutput.onMount(this.pSelector);
        this.exportOutput.onMount(this.pSelector);
    }


    getHtml() {

        // language=HTML
        return `
            <div id="${this.id}">
                <h4>Result:</h4>

                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" id="json-tab" data-toggle="tab" href="#json${this.id}" role="tab" aria-controls="json" aria-selected="true">Json</a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link active" id="profile-tab" data-toggle="tab" href="#table${this.id}" role="tab" aria-controls="table" aria-selected="false">Table</a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" id="contact-tab" data-toggle="tab" href="#export${this.id}" role="tab" aria-controls="export" aria-selected="false">Export</a>
                      </li>
                    </ul>

                    <div class="tab-content" id="myTabContent">
                      <div class="tab-pane fade " id="json${this.id}" role="tabpanel" aria-labelledby="json-tab">

                            <br>
                            ${this.jsonOutput.getMainHtmlCode()}


                      </div>
                      <div class="tab-pane fade show active" id="table${this.id}" role="tabpanel" aria-labelledby="table-tab">

                            <br>
                            ${this.tableOutput.getMainHtmlCode()}

                      </div>
                      <div class="tab-pane fade" id="export${this.id}" role="tabpanel" aria-labelledby="export-tab">

                            <br>
                            ${this.exportOutput.getMainHtmlCode()}

                      </div>
                    </div>
                    <br><br>

            </div>`;

    }

    generateResultAndInjectIntoDom(query) {
        //this.pSelector = $("#" + this.id);//it seems i have to reattach also the beginning of the selector, otherwise it wouldnt work
        let thisdata = this;
        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
            thisdata.jsonOutput.updateText(jsonString);
            //TODO to more
        });
    }

    updateState(formGraphQL) {
        let thisdata = this;
        this.tableOutput.updateState(formGraphQL);
    }


}
