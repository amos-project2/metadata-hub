/**
 * Its a high cohesive class to FormQueryEditor.
 * It depends on the dom, which is generated there.
 * So you cant use this class in an other context.
 */
export class MetadataAutocompletion {

    constructor(graphQlFetcher, fileTypesSelector, currentFilterListSelector, currentMetadataListSelector, modalOpenerSelector) {
        this.graphQlFetcher = graphQlFetcher;
        this.fileTypesSelector = fileTypesSelector;
        this.currentFilterListSelector = currentFilterListSelector;
        this.currentMetadataListSelector = currentMetadataListSelector;
        this.modalOpenerSelector = modalOpenerSelector;

        this.fileTypes = [];
        this.filter = [];
        this.metadata = [];
    }

    updateLists() {

        //reset
        this.fileTypes = [];
        this.filter = [];
        this.metadata = [];


        let thisdata = this;

        $(this.fileTypesSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.fileTypes.push($(this).val());
        });

        $(this.currentFilterListSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.filter.push($(this).val());
        });

        $(this.currentMetadataListSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.metadata.push($(this).val());
        });
    }

    showLists() {
        this.updateLists();
        alert(this.fileTypes);
        alert(this.filter);
        alert(this.metadata);
    }


    addListener() {
        $(this.modalOpenerSelector).click(function () {
            $('#metadata-autocompletion-modal').modal();
        });
    }


    getStaticModalHtml() {

        return `
            <div class="modal fade" id="metadata-autocompletion-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Metadata Suggestions</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Here you automatically add Metadataattributes to the filtersection and metadata-select-section
                            <div class="metadata-autocompletion-suggestions-html"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success save-metadata-autocompletion" data-dismiss="modal">Save</button>

                        </div>
                    </div>
                </div>
            </div>`;
    }

}
