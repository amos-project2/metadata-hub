export class SaveModal {


    constructor() {

    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="save-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Query-Editor Storage</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span class="text-success font-weight-bold save-success">The Query-Editor was saved</span>
                            <span class="text-warning font-weight-bold save-error">The Query-Editor is already saved.</span>
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
        $('#save-modal').modal();
    }

    openModalWithState(success) {

        if (success) {
            $(".save-success").show();
            $(".save-error").hide();

        } else {
            $(".save-success").hide();
            $(".save-error").show();
        }

        this.openModal();
    }

}
