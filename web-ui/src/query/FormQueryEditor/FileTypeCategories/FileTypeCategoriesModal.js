export class FileTypeCategoriesModal {

    constructor() {

    }

    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="category-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Category-Service</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <span class="text-success font-weight-bold category-modal-content">The Query-Editor was saved</span>
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
        $('#category-modal').modal();
    }

    openModalWithText(text, success) {

        let selector = $(".category-modal-content");

        if (success) {
            selector.addClass("text-success");
            selector.removeClass("text-danger");
        } else {
            selector.addClass("text-danger");
            selector.removeClass("text-success");
        }

        selector.html(text);

        this.openModal();
    }
}
