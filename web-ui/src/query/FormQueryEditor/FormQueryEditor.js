import {Page} from "../../Page";
import {ResultPresenter} from "../../ResultPresenter/ResultPresenter";
import {MetadataAutocompletion} from "./autocompletion/MetadataAutocompletion";
import {InputFieldMultiplier} from "../../Utilities/InputFieldMultiplier";
import {GraphQlIntrospectionModel} from "./Modals/GraphQlIntrospectionModel";
import {AdvancedFilter} from "./Components/AdvancedFilter";
import {FormGraphQl} from "./Components/FormGraphQl";
import {FiletypeFilter} from "./Components/FiletypeFilter";
import {AttributSelector} from "./Components/AttributSelector";
import {DateRangeFilter} from "./Components/DateRangeFilter";

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

        this.dateRangeFilter = new DateRangeFilter();
        this.filetypeFilter = new FiletypeFilter(this.metadatAutocompletion);
        this.advancedFilter = new AdvancedFilter(this.metadatAutocompletion);
        this.attributSelector = new AttributSelector(this.metadatAutocompletion);

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

               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <!--     date-range-filter           -->
                ${this.dateRangeFilter.getMainHtmlCode()}

               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <!--     filetypes filter           -->
                ${this.filetypeFilter.getMainHtmlCode()}

               <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <!--     Advanced-Filter           -->
                ${this.advancedFilter.getMainHtmlCode()}

                <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                 <!--     Attribut-Selector           -->
                 ${this.attributSelector.getMainHtmlCode()}


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
            <div class="resultView1">
                ${this.resultPresenter.getHtml()}
            </div>


            ${this.graphQLIntrospectionModal.getHtmlCode()}

            ${this.metadatAutocompletion.getSuggestionViewer().getStaticModalHtml()}
            ${this.metadatAutocompletion.getStaticModalHtmlClearCache()}

            `;

    }

    onMount() {

        this.dateRangeFilter.onMount();
        this.filetypeFilter.onMount();
        this.advancedFilter.onMount();
        this.attributSelector.onMount();

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
        this.dateRangeFilter.inputValidation();

        //Limit Limit input to integer
        $("#fq-limit").focusout(function () {
            let tmpLimit = $("#fq-limit").val();
            $("#fq-limit").val(tmpLimit.replace(/[^0-9]/g, ''));
        })

    }

    inputSuggestion() {

    }

    buildAndGetGraphQlQuery() {

        let formGraphQl = new FormGraphQl();

        this.dateRangeFilter.generateGraphQlCodeAndSetTo(formGraphQl)
        this.filetypeFilter.generateGraphQlCodeAndSetTo(formGraphQl);
        this.advancedFilter.generateGraphQlCodeAndSetTo(formGraphQl);
        this.attributSelector.generateGraphQlCodeAndSetTo(formGraphQl);

        let limit = $("#fq-limit").val();
        let showDeleted = $("#fq-showDeleted").prop('checked');
        let deleted = "";

        if (limit !== "") {limit = `limitFetchingSize: ${limit},\n  `;} else {limit = "";}
        if (showDeleted) {deleted = `showDeleted: true,\n  `;}

        formGraphQl.limit = limit;
        formGraphQl.showDeleted = showDeleted;

        return formGraphQl.generateAndGetGraphQlCode();
    }


    onUnMount() {

    }

    onRegister() {

    }

    onUnLoad() {

    }

}
