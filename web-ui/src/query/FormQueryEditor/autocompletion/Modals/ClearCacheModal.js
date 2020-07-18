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
                            <h5 class="modal-title" id="exampleModalLabel">Clear Cache</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Different Caches (Autocompletion, Query-Cache, ...) are cleared automatically after a certain amount of time.<br> Now you forced to clear it.<br><br>
                            <span class="text-success font-weight-bold">It was succesfully cleared.</span>
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
