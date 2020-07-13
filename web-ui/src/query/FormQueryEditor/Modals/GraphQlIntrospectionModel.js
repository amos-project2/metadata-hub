export class GraphQlIntrospectionModel {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }


    constructor(storage, isParentEditor) {
        this.storage = storage;
        this.isParentEditor = isParentEditor;

        this.id = "inspection-window-" + GraphQlIntrospectionModel.increaseCount();
        this.pSelector = $("#" + this.id);
    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="${this.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">GraphQl Code Inspection</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <pre class="graphql-code-content"></pre>
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
        this.pSelector.modal();
    }

    //public
    getContentSelector() {
        return this.pSelector.find(".graphql-code-content");
    }


    //public
    openModalWithContent(content) {
        console.log(this.getContentSelector().html());
        this.getContentSelector().text(content);
        this.openModal();
    }


    onMount() {

        this.pSelector = $("#" + this.id);

        this.pSelector.find(".send-to-graphiql").click(() => {
            this.storage.query_inject = this.getContentSelector().text();
            this.storage.openedFromEditor = this.isParentEditor;
            $("#nav-element-graphiql-console").trigger("click");

        });
    }

}
