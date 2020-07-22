import {JsonOutput} from "./Components/JsonOutput";
import {TableOutput} from "./Components/TableOutput";
import {ExportOutput} from "./Components/ExportOutput";
import {ControllUnits} from "./Components/ControllUnits";
import {DetailViewModal} from "./Modal/DetailViewModal";
import {DownloadSucessModal} from "./Modal/DownloadSucessModal";

export class ResultPresenter {

    static increaseCount() {
        this.count = this.getCount() + 1;
    }

    static getCount() {
        return this.count || 0;
    }

    constructor(graphQlFetcher, graphQLIntrospectionModal, restApiFetcherServer) {
        ResultPresenter.increaseCount();
        this.id = "ResultPresenter-" + ResultPresenter.getCount();
        this.pSelector = $("#" + this.id);
        this.graphQlFetcher = graphQlFetcher;

        this.downloadSuccessModal = new DownloadSucessModal(this.id);

        this.controllUnits = new ControllUnits("result-presenter" + this.id, this, graphQLIntrospectionModal);
        this.viewModal = new DetailViewModal(this.graphQlFetcher);

        this.jsonOutput = new JsonOutput();
        this.tableOutput = new TableOutput(this, this.controllUnits, this.viewModal);
        this.exportOutput = new ExportOutput(this.downloadSuccessModal, restApiFetcherServer);


        this.cleared = true;
        this.lastTotalFiles = -1;

    }

    onMount() {

        this.viewModal.onMount();

        this.pSelector = $("#" + this.id);

        this.controllUnits.onMount(this.pSelector, this.pSelector.find('.show-entries-container'), this.pSelector.find('.paginator-all-container'));

        this.jsonOutput.onMount(this.pSelector);
        this.tableOutput.onMount(this.pSelector);
        this.exportOutput.onMount(this.pSelector);
    }


    getHtml() {

        // language=HTML
        return `
            ${this.downloadSuccessModal.getHtmlCode()}
            <div id="${this.id}">
                <h4>Result:</h4>

                <ul class="nav nav-tabs myTab" id="myTab${this.id}" role="tablist">
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
                        Only after sending a query first, you can get a result.
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

    showTabs() {
        let messageContainer = this.pSelector.find(".message-container");
        let loadContainer = this.pSelector.find(".load-icon-container");
        let mainTabContent = this.pSelector.find(".main-tab-content");

        mainTabContent.stop(true).show(1000);
        messageContainer.stop(true).hide(1000);
        loadContainer.stop(true).hide(1000);
    }


    waitForLoad() {
        this.pSelector.find(".load-icon-container").show(1000);
    }


    /**
     * This method is called by the client each time he want to get a fresh visualiziation of a fresh query
     */
    //public
    updateState(formGraphQL) {
        let thisdata = this;
        this.cleanUp();
        this.waitForLoad();

        thisdata.jsonOutput.updateText("wait for server-answer...");
        thisdata.tableOutput.clearHtml();

        formGraphQL.setOffset(0);
        formGraphQL.setLimit(5);
        formGraphQL.setSorting({attribute: "id", asc: true});


        $('html, body').stop(true).animate({
            scrollTop: '+=150px'
        }, 1000);

        this.sendToServerAndAdjust(formGraphQL);
    }


    /**
     * This method fetch the data from the server and calls the right method if there is an error or if it is succesfull.
     */
    //private
    sendToServerAndAdjust(formGraphQL) {
        let thisdata = this;
        let query = formGraphQL.generateAndGetGraphQlCode();

        this.preLoad();

        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {
            if (sucess && json && !json.errors && json.data.searchForFileMetadata && !json.data.searchForFileMetadata.error) {
                thisdata.updateInternalState(formGraphQL, json);
            } else if (json === null) {
                thisdata.updateError({message: "The ressource/Server is not available", info: jsonString});
            } else if (json.errors) {
                thisdata.updateError({message: "An Error while parsing the Query has occured. Please don't use unescaped quotation marks, for example.", info: JSON.stringify(json, undefined, 2)});
            } else {
                let err = {
                    message: json.data.searchForFileMetadata.error.message,
                    info: json.data.searchForFileMetadata.error.stack_trace,
                };
                thisdata.updateError(err);
            }

            thisdata.postLoad();


        });

    }

    /**
     * This method is internally called, after the server-response has no error and is there.
     */
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
        this.exportOutput.updateState(formGraphQL, json);

        this.showTabs();

    }


    /**
     * This method is called after server-success and if it is a fresh-request
     */
    //private
    reinitialize(formGraphQL, json) {
        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;

        this.cleared = false;
        this.lastTotalFiles = totalFiles;

        this.controllUnits.reinitialize(formGraphQL, json);
        this.tableOutput.reinitialize();
        this.exportOutput.reinitialize(formGraphQL);

        if (totalFiles < 3) {
            this.controllUnits.hidePaginatorAndSelectBox()
        }

        let thisdata = this;
        $('html, body').stop(true).animate({
            scrollTop: $("#myTab" + this.id).offset().top
        }, 2000);


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

    //private
    updateError(error) {
        this.cleanUp();

        let messageContainer = this.pSelector.find(".message-container");

        messageContainer.html(`
        <div class="text-danger">
            <b>Error: ${error.message}</b><br><br>
            <b>Info:</b>
            <pre style="color: orangered">${error.info}</pre>
        </div>
        <br><br>
        `);

        messageContainer.stop(true).show(1000);
        $('html, body').stop(true).animate({
            scrollTop: $("#myTab" + this.id).offset().top
        }, 2000);

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
