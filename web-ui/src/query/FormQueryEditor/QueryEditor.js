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
import {ClearCacheModal} from "./autocompletion/Modals/ClearCacheModal";
import {FileTypeCategoriesService} from "./FileTypeCategories/FileTypeCategoriesService";
import {StoreService} from "./QueryStore/StoreService";

export class QueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Query Editor";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;

        this.graphQLIntrospectionModal = new GraphQlIntrospectionModel(this.parent.storage, true);
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher, this.graphQLIntrospectionModal);
        this.clearCacheModal = new ClearCacheModal();
        this.clearCacheSelector = ".modalClearCache";

        this.fileTypeCategoriesService = new FileTypeCategoriesService();

        this.metadatAutocompletion = new MetadataAutocompletion(
            this.parent.dependencies.restApiFetcherServer,
            this.graphQlFetcher,
            ".filetype-element-input",
            ".fg-metadata-attribute",
            ".attribut-element-input",
            ".modalOpenerSelector",
        );

        this.dateRangeFilter = new DateRangeFilter();
        this.filetypeFilter = new FiletypeFilter(this.metadatAutocompletion);
        this.advancedFilter = new AdvancedFilter(this.metadatAutocompletion);
        this.attributSelector = new AttributSelector(this.metadatAutocompletion);

        this.metadatAutocompletion.addAdvancedFilter(this.advancedFilter);
        this.metadatAutocompletion.addAttributSelector(this.attributSelector);

        this.storeService = null;//new StoreService(this, this.parent.dependencies.restApiFetcherServer);

        this.isFreshInstallation = false;

    }

    setStoreService(storeService) {
        this.storeService=storeService
    }


    content() {

        // language=HTML
        return `
            <form class="q-send-query-form-editor">


            <!--     for tracking          -->

                <div class="form-row">

                    <div class="form-group col-md-6">
                        <label for="fq-query-Name">Query-Name <a class="pover" title="Query-Name" data-content="The Name, which is saved with the query here into the database to find it later again.">[?]</a></label>
                        <input type="text" class="form-control save-element save-title" data-name="g1" id="fq-query-Name" value="searchForFileMetadata">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-owner">Owner <a class="pover" title="Owner" data-content="The Owner, which is saved with the query here into the database.">[?]</a></label>
                        <input type="text" class="form-control save-author" data-name="g2" id="fq-owner" value="${localStorage.getItem("username")}" disabled>
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

                <div class="form-row" style="display: none;">
                    <div class="form-group col-md-12">
                        <label for="fq-limit">Limit <a class="pover" title="Limit" data-content="The max output limit.<br>Empty means no limit.">[?]</a></label>
                        <input type="text"  class="form-control" id="fq-limit" value="2">
                    </div>
                </div>

                <div class="form-check">
                    <input class="form-check-input save-element" data-name="g3" type="checkbox" value="" id="fq-showDeleted">
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

                <button type="submit" class="btn btn-success">Send</button>
                <button type="button" class="btn btn-primary open-query">Open Intermediate Query</button>
                <button type="button" class="btn btn-success save-editor">Save Editor</button>
                <button type="button" class="btn btn-danger modalClearCache">Clear Cache</button>
                <button type="button" class="btn btn-primary clear-all">Clear All</button>
            </form>
            <br>
            <div class="resultView1">
                ${this.resultPresenter.getHtml()}
            </div>


            ${this.graphQLIntrospectionModal.getHtmlCode()}
            ${this.fileTypeCategoriesService.getModalHtml()}
            ${this.resultPresenter.viewModal.getHtmlCode()}
            ${this.storeService.getSaveModal().getHtmlCode()}

            ${this.metadatAutocompletion.getSuggestionViewer().getStaticModalHtml()}
            ${this.clearCacheModal.getHtmlCode()}

            `;

    }

    onMount() {

        this.graphQLIntrospectionModal.onMount();
        this.clearCacheModalOpenerAndRequest();

        this.resultPresenter.onMount();

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
            thisdata.storeService.saveEditor(true);
            let formGraphQL = thisdata.buildAndGetGraphQlQuery();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(formGraphQL.generateAndGetGraphQlCode());
            thisdata.resultPresenter.updateState(formGraphQL);
        });

        $(".open-query").click(function () {
            thisdata.graphQLIntrospectionModal.openModalWithContent(thisdata.buildAndGetGraphQlQuery().generateAndGetGraphQlCode());
        });

        $(".save-editor").click(function () {
            let back = thisdata.storeService.saveEditor(true);
            thisdata.storeService.getSaveModal().openModalWithState(back);
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
        formGraphQl.deleted = deleted;

        return formGraphQl;//.generateAndGetGraphQlCode();
    }

    clearCacheModalOpenerAndRequest() {
        let thisdata = this;
        $(this.clearCacheSelector).click(function () {
            thisdata.clearCacheModal.openModal();
            thisdata.restApiFetcherServer.fetchGet(`metadata-autocomplete/clear-cache/`, function (event) {});
        });
    }

    onLoad() {
        if (this.storeService.injectIntoQueryEditor) {
            if (!this.isFreshInstallation) {
                this.isFreshInstallation = true;
                this.clearCache();
                this.reload();
                return;
            }

            this.isFreshInstallation = false;
            this.storeService.doRestoringLastSave();
            this.storeService.saveEditor(false);
        }
    }


    onUnMount() {

    }

    onRegister() {

    }

    onUnLoad() {

    }

}
