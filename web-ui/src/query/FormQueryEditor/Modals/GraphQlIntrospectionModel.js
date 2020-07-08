export class GraphQlIntrospectionModel {


    constructor() {

    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="graphql-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">GraphQl Code Inspection</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <pre id="graphql-code-content"></pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary send-to-graphiql" data-dismiss="modal">Send to GraphiQL</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;

    }

    //public
    openModal() {
        $('#graphql-modal').modal();
    }

    //public
    getContentSelector() {
        return $("#graphql-code-content");
    }


    //public
    openModalWithContent(content) {
        this.getContentSelector().text(content);
        this.openModal();
    }

}
