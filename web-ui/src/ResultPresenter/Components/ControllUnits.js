import {Paginator} from "./Paginator";

export class ControllUnits {


    constructor(htmlUniqueId, resultPresenter, graphQLIntrospectionModal) {
        this.pSelector = null;
        this.showEntrySelector = null;
        this.paginatorSelector = null;


        this.graphQLIntrospectionModal = graphQLIntrospectionModal;
        this.resultPresenter = resultPresenter;
        this.id = "controll-units" + htmlUniqueId;
    }

    onMount(pSelector, showEntrySelector, paginatorSelector) {
        this.pSelector = pSelector;
        this.showEntrySelector = showEntrySelector;
        this.paginatorSelector = paginatorSelector;

    }

    injectNewHtml(paginatorHtmlCode) {

        // language=HTML
        this.showEntrySelector.html(`
            <div class="row" style="margin:5px;">
                <label class="col-form-label for-hiding">Show entries: </label>
                <div class="for-hiding">
                    <select name="length" class="custom-select custom-select-sm form-control form-control-sm myTableLength">
                        <option value="2" selected>2</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div style="margin:5px;" class="for-hiding" data-toggle="tooltip-vis" data-placement="top" title="Please go to the Table Tab for selecting a sorting attribute. You can click on the table columns to sort by a specific attribute or change the sotring order(ascending or descending).">
                    Sorting: <span class="badge badge-success mySorting"> id (ascending) </span>
                </div>

                <div style=" margin:2px; cursor: pointer" data-toggle="tooltip-vis" data-placement="top" title="Show the final query, with pagination-information(limit, offset) included">
                    <button type="button" class="btn btn-primary open-final-query btn-sm">Open Final GraphQL Query</button>
                </div>

            </div>
        `);


        this.paginatorSelector.html(`
            <div class="paginator-container for-hiding">
                ${paginatorHtmlCode}
            </div>
            Entries: <span class="myEntryCount">load...</span>
        `);

        $(function () {
            $('[data-toggle="tooltip-vis"]').tooltip()
        })

    }

    reinitialize(formGraphQL, initJson) {
        let thisdata = this;


        let totalFiles = initJson.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = initJson.data.searchForFileMetadata.numberOfReturnedFiles;

        let paginator = new Paginator(this.id, 2, totalFiles, 1);
        paginator.registerPageListener(function (elem) {
            thisdata.pSelector.find('.paginator-container').html(elem.getHtmlCode());
            elem.addListener();

            formGraphQL.setOffset(elem.startIndex);
            formGraphQL.setLimit(elem.countElementsPerPage);
            thisdata.resultPresenter.sendToServerAndAdjust(formGraphQL);

        });


        this.injectNewHtml(paginator.getHtmlCode())


        paginator.addListener();

        this.pSelector.find('.myTableLength').change(function () {
            paginator.setElementsPerPage($(this).val());

        });


    }

    updateState(formGraphQL, json) {
        let sorting = formGraphQL.sortingIntern;
        let scending = " (descending) ";
        if(sorting.asc) {
            scending = " (ascending) ";
        }
        this.pSelector.find(".mySorting").html(sorting.attribute+scending);

        this.pSelector.find(".open-final-query").off(); // remove last listener
        this.pSelector.find(".open-final-query").click(()=>{
            this.graphQLIntrospectionModal.openModalWithContent(formGraphQL.generateAndGetGraphQlCode());
        });
    }


    //Object.keys(structure).length - 2
    updateEntryCounter(formGraphQL, json, metadatacolums) {

        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;

        let offsetLimit = formGraphQL.getOffset() + currentFiles;
        let offsetFiles = formGraphQL.getOffset() + 1;
        if (currentFiles === 0) offsetFiles = 0;
        this.pSelector.find('.myEntryCount').html(`<b>${offsetFiles} - ${offsetLimit} [${currentFiles}] from ${totalFiles}</b> | metadata columns: ${metadatacolums}`);

    }

    hidePaginatorAndSelectBox() {
        $(".for-hiding").hide();
    }

}
