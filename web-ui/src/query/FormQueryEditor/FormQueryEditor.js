import {Page} from "../../Page";
import {ResultPresenter} from "../../buisnesslogic/ResultPresenter";
import {MetadataAutocompletion} from "./autocompletion/MetadataAutocompletion";
import {InputFieldMultiplier} from "../../buisnesslogic/InputFieldMultiplier";
import {GraphQlIntrospectionModel} from "./Modals/GraphQlIntrospectionModel";
import {AdvancedFilter} from "./Components/AdvancedFilter";
import {FormGraphQl} from "./Components/FormGraphQl";

export class FormQueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Form Query Editor";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
        this.graphQLIntrospectionModal = new GraphQlIntrospectionModel()

        this.metadatAutocompletion = new MetadataAutocompletion(
            this.parent.dependencies.restApiFetcherServer,
            this.graphQlFetcher,
            ".filetype-element-input",
            ".fg-metadata-attribute",
            ".attribut-element-input",
            ".modalOpenerSelector",
            ".modalClearCache"
        );


        this.advancedFilter = new AdvancedFilter(this.metadatAutocompletion);

        this.inputMultiplierFiletypeFilter = this.inputMultiplierFiletypeFilterBuilder();
        this.inputMultiplierAttributSelector = this.inputMultiplierAttributSelectorBuilder();

    }


    inputMultiplierFiletypeFilterBuilder() {

        let thisdata = this;
        let emptyFunction = function () {};

        let appendingHtmlCode = `<div class="form-group col-md-4 fg-filetype-element"><input type="text" class="form-control filetype-element-input"></div>`;

        let focusOutFunction = function () {
            thisdata.metadatAutocompletion.updateLists();
        }

        let focusInIfEmptyFieldFunction = function () {
            thisdata.metadatAutocompletion.reAddListener();
        };


        return new InputFieldMultiplier(".fg-filetype-container", ".filetype-element-input", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, emptyFunction);

    }




    inputMultiplierAttributSelectorBuilder() {

        let thisdata = this;
        let emptyFunction = function () {};
        let appendingHtmlCode = `<div class="form-group col-md-4 fg-attribut-element"><input type="text" class="form-control attribut-element-input"></div>`;

        let focusOutFunction = function () {
            thisdata.metadatAutocompletion.updateLists();
        }


        let focusInIfEmptyFieldFunction = function () {
            thisdata.metadatAutocompletion.reAddListener();
        };


        return new InputFieldMultiplier(".fg-attribut-container", ".attribut-element-input", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, emptyFunction);

    }


    content() {

        // language=HTML
        return `
            <form class="q-send-query-form-editor">


            <!--     for tracking          -->

                <div class="form-row">

                    <div class="form-group col-md-6">
                        <label for="fq-query-Name">Query-Name <a class="pover" title="Query-Name" data-content="The Name, which is saved with the query here into the database to find it later again.">[?]</a></label>
                        <input type="text" class="form-control" id="fq-query-Name" value="searchForFileMetadata">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-owner">Owner <a class="pover" title="Owner" data-content="The Owner, which is saved with the query here into the database.">[?]</a></label>
                        <input type="text" class="form-control" id="fq-owner" value="${localStorage.getItem("username")}" disabled>
                    </div>
                </div>

<!--     date-range-filter           -->

               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStart">Start-DateTime (File created)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (created-time) than Start-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeStart" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEnd">End-DateTime (File created)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (created-time) than End-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeEnd" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>



                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStartUpdated">Start-DateTime (File modified)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (modified-time) than Start-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeStartUpdated" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEndUpdated">End-DateTime (File modified)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (modified-time) than End-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeEndUpdated" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>
<!--     filetypes filter           -->

               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <div class="form-row">
                    <div class="col-md-12">Which Filetypes: <a class="pover" title="Which Filetypes" data-content="Here you can specify a prefilter of filetypes. If it is empty means, no filetype-filter here">[?]</a></div>
                </div>


                <div class="fg-filetype-container form-row">

                       ${this.inputMultiplierFiletypeFilter.getFirstElement()}

<!--                    <div class="form-group col-md-4 fg-filetype-element">-->
<!--                        <input type="text" class="form-control filetype-element-input" autocomplete="off">-->
<!--                    </div>-->

                </div>
                <div class="form-row justify-content-md-center">
                    <button type="button" class="btn btn-primary modalOpenerSelector mr-3">Open Metadata-Attribut-Selector</button>
                    <button type="button" class="btn btn-danger modalClearCache mr-3">Clear Autocompletion Cache</button>
                </div>





               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <!--     Advanced-Filter           -->
                ${this.advancedFilter.getMainHtmlCode()}


                 <!--     Attribut-Selector           -->


                <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <div class="form-row">
                    <div class="col-md-12">Which Attributes: <a class="pover" title="Which Attributes" data-content="Here you can limit the result to the specific metadata attributes.<br>If you dont add least one, then you get a result of all">[?]</a></div>
                </div>


                <div class="fg-attribut-container form-row">

                    ${this.inputMultiplierAttributSelector.getFirstElement()}

<!--                    <div class="form-group col-md-4 fg-attribut-element">-->
<!--                        <input type="text" class="form-control attribut-element-input">-->
<!--                    </div>-->
                </div>



                <!--     limit           -->

                 <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-12">
                        <label for="fq-limit">Limit <a class="pover" title="Limit" data-content="The max output limit.<br>Empty means no limit.">[?]</a></label>
                        <input type="text"  class="form-control" id="fq-limit" value="3">
                    </div>
                </div>

                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="fq-showDeleted">
                    <label class="form-check-label" for="fq-showDeleted">
                        Show deleted files
                        <a class="pover" title="Show deleted files" data-content="If checked deleted files that are still in the database are also shown.">[?]</a>
                    </label>
                </div>

                 <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <!--     Controll-Buttons           -->

                <button type="submit" class="btn btn-primary">Send</button>
                <button type="button" class="btn btn-primary open-query">Open Query</button>
                <button type="button" class="btn btn-primary send-to-graphiql">Send to GraphiQL</button>
                <button type="button" class="btn btn-primary clear-all">Clear All</button>
            </form>
            <br>
            <div class="resultView1"></div>


            ${this.graphQLIntrospectionModal.getHtmlCode()}

            ${this.metadatAutocompletion.getSuggestionViewer().getStaticModalHtml()}
            ${this.metadatAutocompletion.getStaticModalHtmlClearCache()}

            `;


    }

    onMount() {

        $(".resultView1").html(this.resultPresenter.getHtml());

        this.inputMultiplierFiletypeFilter.listenerAdd();
        this.inputMultiplierAttributSelector.listenerAdd();

        this.advancedFilter.onMount();

        this.inputValidation();
        this.inputSuggestion();
        this.metadatAutocompletion.addListener();

        let thisdata = this;

        $(".q-send-query-form-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.buildAndGetGraphQlQuery());

        });

        $(".open-query").click(function () {
            thisdata.graphQLIntrospectionModal.openModalWithContent(thisdata.buildAndGetGraphQlQuery());
        });

        $(".send-to-graphiql").click(function () {

            thisdata.parent.storage.query_inject = thisdata.buildAndGetGraphQlQuery();
            thisdata.parent.storage.openedFromEditor = true;
            $("#nav-element-graphiql-console").trigger("click");

        });


        $(".clear-all").click(function () {
            thisdata.clearCache();
            thisdata.reload();
        });

    }


    inputValidation() {

        //Validate Date
        $("#fq-createFileTimeRangeStart").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeStart");

            let startDate = $("#fq-createFileTimeRangeStart").val();
            let endDate = $("#fq-createFileTimeRangeEnd").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('Start Time must be before End Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeEnd").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeEnd");

            let startDate = $("#fq-createFileTimeRangeStart").val();
            let endDate = $("#fq-createFileTimeRangeEnd").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('End Time must be after Start Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeStartUpdated").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeStartUpdated");

            let startDate = $("#fq-createFileTimeRangeStartUpdated").val();
            let endDate = $("#fq-createFileTimeRangeEndUpdated").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('Start Time must be before End Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeEndUpdated").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeEndUpdated");

            let startDate = $("#fq-createFileTimeRangeStartUpdated").val();
            let endDate = $("#fq-createFileTimeRangeEndUpdated").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('End Time must be after Start Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        //Limit Limit input to integer
        $("#fq-limit").focusout(function () {
            let tmpLimit = $("#fq-limit").val();
            $("#fq-limit").val(tmpLimit.replace(/[^0-9]/g, ''));
        })

    }

    inputSuggestion() {


        //Set owner to user
        //$("#fq-owner").val(localStorage.getItem("username"))
    }


    buildAndGetGraphQlQuery() {

        let formGraphQl = new FormGraphQl();
        this.advancedFilter.generateGraphQlCodeAndSetTo(formGraphQl);


        let limit = $("#fq-limit").val();
        let showDeleted = $("#fq-showDeleted").prop('checked');
        let deleted = "";
        let startDate = $("#fq-createFileTimeRangeStart").val();
        let endDate = $("#fq-createFileTimeRangeEnd").val();

        let startDateUpdated = $("#fq-createFileTimeRangeStartUpdated").val();
        let endDateUpdated = $("#fq-createFileTimeRangeEndUpdated").val();

        let filterOption = $(".fg-filter-connector-options").val();
        let filterCustomString = $("#fq-custom-filter-connector").val();


        // if (filepattern !== "") {filepattern = `pattern: "${filepattern}",`;} else {filepattern = "";}
        // if (!checkbox) {checkbox = "option: included,";} else {checkbox = "option: excluded,";}
        if (limit !== "") {limit = `limitFetchingSize: ${limit},\n  `;} else {limit = "";}
        if (showDeleted) {deleted = `showDeleted: true,\n  `;}

        if (startDate !== "") {startDate = `start_creation_time: "${startDate}",\n  `;} else {startDate = "";}
        if (endDate !== "") {endDate = `end_creation_time: "${endDate}",\n  `;} else {endDate = "";}
        if (startDateUpdated !== "") {startDateUpdated = `start_modification_time: "${startDateUpdated}",\n  `;} else {startDateUpdated = "";}
        if (endDateUpdated !== "") {endDateUpdated = `end_modification_time: "${endDateUpdated}",\n  `;} else {endDateUpdated = "";}

        formGraphQl.limit = limit;
        formGraphQl.showDeleted = showDeleted;
        formGraphQl.startDate = startDate;
        formGraphQl.endDate = endDate;
        formGraphQl.startDateUpdated = startDateUpdated;
        formGraphQl.endDateUpdated = endDateUpdated;

        let attributes = "";
        {
            this.inputMultiplierAttributSelector.each(function(elem){
                attributes += `"${$(elem).val()}", `;
            });


            if (attributes !== "") {
                attributes = `selected_attributes:[${attributes}],\n  `;
            }
        }


        let filetypes = "";
        {
            this.inputMultiplierFiletypeFilter.each(function (elem) {
                filetypes += `"${$(elem).val()}", `;
            });


            if (filetypes !== "") {
                filetypes = `file_types:[${filetypes}],\n  `;
            }
        }

        formGraphQl.attributes = attributes;
        formGraphQl.filetypes = filetypes;


        return formGraphQl.generateAndGetGraphQlCode();



    }


    onUnMount() {

    }

    onRegister() {

    }

    onUnLoad() {

    }

}
