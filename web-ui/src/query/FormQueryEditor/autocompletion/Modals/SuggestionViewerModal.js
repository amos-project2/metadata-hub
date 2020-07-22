export class SuggestionViewerModal {


    constructor() {

    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="metadata-autocompletion-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Metadata Attribute Suggestions</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Here you can add Metadata Attributes to the Metadata Filters or the Returned Metadata Attributes.
                            <br>
                            <br><b>Filters:</b> Add this Metadata Attribute to the Metadata Filter Section.
                            <br><b>Return:</b> Add this Metadata Attribute to the Returned Metadata Attribute Section.
                            <hr>
                            <div class="metadata-autocompletion-suggestions-html"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success load-more-suggestions">Load more suggestions</button>

                        </div>
                    </div>
                </div>
            </div>`;

    }

    //public
    openModal() {
        $('#metadata-autocompletion-modal').modal();
    }

    getContentSelector() {
        return $(".metadata-autocompletion-suggestions-html");
    }

    getLoadMoreSelector() {
        return $(".load-more-suggestions");
    }

}
