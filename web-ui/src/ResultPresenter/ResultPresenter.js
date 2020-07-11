import {JsonOutput} from "./Components/JsonOutput";
import {TableOutput} from "./Components/TableOutput";
import {ExportOutput} from "./Components/ExportOutput";
import {ControllUnits} from "./Components/ControllUnits";

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

        this.controllUnits = new ControllUnits("result-presenter" + this.id, this);

        this.jsonOutput = new JsonOutput();
        this.tableOutput = new TableOutput(this, this.controllUnits);
        this.exportOutput = new ExportOutput();

        this.cleared = true;
        this.lastTotalFiles = -1;

    }

    onMount() {

        this.pSelector = $("#" + this.id);

        this.controllUnits.onMount(this.pSelector, this.pSelector.find('.show-entries-container'), this.pSelector.find('.paginator-all-container'));

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

                    <br>

                    <div class="load-icon-container" style="display: none">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    <div class="message-container">
                        Send a Query first, then you get the Result.
                    </div>


                <div class="tab-content main-tab-content" id="myTabContent" style="display:none">




                    <div class="controll-unit-loader">
                        <div class="spinner-border text-primary" role="status">
                             <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    <div class="controll-unit">
                           <!--   show-entries  -->
                           <div class="show-entries-container">

                           </div>
                           <!--   end show-entries  -->
                    </div>


<!--                    <div class="main-tab-content" style="display:none;">-->

                        <div class="tab-pane fade " id="json${this.id}" role="tabpanel" aria-labelledby="json-tab">


                            ${this.jsonOutput.getMainHtmlCode()}


                        </div>
                        <div class="tab-pane fade show active" id="table${this.id}" role="tabpanel" aria-labelledby="table-tab">


                            ${this.tableOutput.getMainHtmlCode()}

                        </div>
                        <div class="tab-pane fade" id="export${this.id}" role="tabpanel" aria-labelledby="export-tab">


                            ${this.exportOutput.getMainHtmlCode()}

                        </div>
<!--                    </div>-->


                 <div class="controll-unit-loader">
                    <div class="spinner-border text-primary" role="status">
                         <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="controll-unit">
                    <!--   paginator  -->
                    <div class="paginator-all-container">

                    </div>
                    <!--   end paginator  -->
                </div>



                </div>

                <br><br>


            </div>
            `;

    }

    generateResultAndInjectIntoDom(query) {
        // //this.pSelector = $("#" + this.id);//it seems i have to reattach also the beginning of the selector, otherwise it wouldnt work
        // let thisdata = this;
        // this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
        //     thisdata.jsonOutput.updateText(jsonString);
        //     //TODO to more
        // });
    }

    waitForLoad() {
        this.pSelector.find(".load-icon-container").show(1000);
    }


    //public
    updateState(formGraphQL) {
        let thisdata = this;
        this.cleanUp();
        this.waitForLoad();

        thisdata.jsonOutput.updateText("wait for server-answer...");
        thisdata.tableOutput.clearHtml();

        formGraphQL.setOffset(0);
        formGraphQL.setLimit(2);

        // this.tableOutput.reinitialize(formGraphQL);
        this.sendToServerAndAdjust(formGraphQL);
    }

    // error(err) {
    //     this.tableOutput.showError(err);
    // }

    //private
    updateInternalState(formGraphQL, json) {

        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;

        if (this.cleared || this.lastTotalFiles !== totalFiles) {
            this.reinitialize(formGraphQL, json);
        }


        this.controllUnits.updateState(formGraphQL, json)
        this.jsonOutput.updateText(JSON.stringify(json, undefined, 2));
        this.tableOutput.updateState(formGraphQL, json);

        this.showTabs();

    }

    //private
    updateError(error) {
        this.cleanUp();

        let messageContainer = this.pSelector.find(".message-container");

        messageContainer.html(`
        <div class="text-danger">
            <b>Error: ${error.message}</b><br><br>
            Info: ${error.info}
        </div>
        `);

        messageContainer.stop(true).show(1000);

    }

    showTabs() {
        let messageContainer = this.pSelector.find(".message-container");
        let loadContainer = this.pSelector.find(".load-icon-container");
        let mainTabContent = this.pSelector.find(".main-tab-content");

        mainTabContent.stop(true).show(1000);
        messageContainer.stop(true).hide(1000);
        loadContainer.stop(true).hide(1000);
    }

    cleanUp() {

        this.cleared = true;

        let messageContainer = this.pSelector.find(".message-container");
        let loadContainer = this.pSelector.find(".load-icon-container");
        let mainTabContent = this.pSelector.find(".main-tab-content");

        mainTabContent.stop(true).hide(1000);
        messageContainer.stop(true).hide(1000);
        loadContainer.stop(true).hide(1000);

    }


    reinitialize(formGraphQL, json) {
        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;

        this.cleared = false;
        this.lastTotalFiles = totalFiles;

        this.controllUnits.reinitialize(formGraphQL, json);
        this.tableOutput.reinitialize();

    }

    //private
    sendToServerAndAdjust(formGraphQL) {
        let thisdata = this;
        let query = formGraphQL.generateAndGetGraphQlCode();

        this.preLoad();

        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
            if (sucess && json.data.searchForFileMetadata && !json.error) {
                thisdata.updateInternalState(formGraphQL, json);
                // thisdata.jsonOutput.updateText(jsonString);
                // thisdata.tableOutput.updateState(formGraphQL, json);
            } else if (json === null) {

                let err = {
                    message: jsonString,
                    info: "",
                };
                thisdata.updateError(err);
            } else {
                thisdata.updateError(json);
            }

            thisdata.postLoad();


        });

    }


    preLoad() {
        this.pSelector.find(".controll-unit-loader").show();
        this.pSelector.find(".controll-unit").hide();
    }

    postLoad() {
        this.pSelector.find(".controll-unit-loader").hide();
        this.pSelector.find(".controll-unit").show();
    }


}
