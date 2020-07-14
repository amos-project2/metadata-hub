export class DownloadSucessModal {


    constructor(parentId) {
        this.parentId = parentId;
    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="download-success${this.parentId}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Download</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span class="text-success font-weight-bold">The download was started successfully</span>

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
        $(`#download-success${this.parentId}`).modal();
    }



}
