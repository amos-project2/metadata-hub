export class ClearCacheModal {


    constructor() {

    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="metadata-autocompletion-modal-clear-cache" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Metadata Suggestions - Clear Cache</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            The Autocompletion-Cache is cleared automatically after each 60min. Now you forced to clear it.<br><br>
                            It was succesfully cleared.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>

                        </div>
                    </div>
                </div>
            </div>`;

    }

    //public
    openModal() {
        $('#metadata-autocompletion-modal-clear-cache').modal();
    }

}
