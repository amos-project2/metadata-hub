import {FormGraphQl} from "../../query/FormQueryEditor/Components/FormGraphQl";

export class ExportOutput {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }

    constructor(downloadSuccessModal) {
        this.downloadSuccessModal = downloadSuccessModal;
        this.id = "export-" + ExportOutput.increaseCount();
        this.pSelector = null;
        this.lastformGraphQL = null;
    }

    getMainHtmlCode() {
        // language=HTML
        return `
            <hr>
            <div id="${this.id}">
                <br>
                <div class="mx-auto init-area" style="width: 290px;">
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" value="" id="meta-all${this.id}">
                        <label class="form-check-label" for="meta-all${this.id}">
                            Include all metadata attributes <br>(Ignore the selection in Returned Metadata Attributes)
                        </label>
                    </div>
                     <div class="form-check mb-4" id="${this.id}">
                        <input class="form-check-input" type="checkbox" value="" id="pagination-no${this.id}">
                        <label class="form-check-label" for="pagination-no${this.id}">
                            Include all files/rows <br>(Ignore pagination[limit, offest])
                        </label>
                    </div>
                    <div class="form-check mb-4" id="${this.id}">
                        <input class="form-check-input" type="checkbox" value="" id="query-include${this.id}">
                        <label class="form-check-label" for="query-include${this.id}">
                           Include the GraphQL query
                        </label>
                    </div>
                    <div class="col text-center mb-4">
                        <button type="button" class="btn btn-primary download-button ">Initialize download</button>
                    </div>
                </div>
                 <div class="mx-auto start-area" style="width: 290px; display: none">

                        <form action="http://localhost:8080/api/export/download" method="post" target="_blank">
                        <div style="display:none">
                        <input type="text" name="query-included" class="tquery-included">
                        <textarea name="query" class="tquery"></textarea>

                        </div>

                         <div class="col text-center mb-4">
                            <button type="button" class="btn btn-danger download-button-abbort download-button-abbort-start">Abort</button>
                        </div>
                         <div class="col text-center mb-4">
                            <button type="submit" class="btn btn-success download-button-start download-button-abbort-start">Start download</button>
                        </div>

                        </form>
                   </div>
                <br>
            </div>
            <hr>`;
    }

    reinitialize(formGraphQL) {
        this.lastformGraphQL = formGraphQL;
        this.pSelector.find(".start-area").hide(1000);
        this.pSelector.find(".init-area").show(1000);
    }

    updateState(formGraphQL, json) {
        this.pSelector.find(".start-area").hide(1000);
        this.pSelector.find(".init-area").show(1000);
    }

    onMount(pSelectorParent) {
        this.pSelector = $("#" + this.id);

        this.pSelector.find(".download-button-abbort-start").click(() => {
            this.pSelector.find(".start-area").hide(1000);
            this.pSelector.find(".init-area").show(1000);
        });

        this.pSelector.find(".download-button-start").click(() => {
            this.downloadSuccessModal.openModal();
        });

        this.pSelector.find(".download-button").click(() => {

            let metaAll = this.pSelector.find(`#meta-all${this.id}`).prop('checked');
            let paginationNo = this.pSelector.find(`#pagination-no${this.id}`).prop('checked');
            let queryInclude = this.pSelector.find(`#query-include${this.id}`).prop('checked');

            if (metaAll) metaAll = true; else metaAll = false;
            if (paginationNo) paginationNo = true; else paginationNo = false;
            if (queryInclude) queryInclude = true; else queryInclude = false;

            // alert(metaAll + paginationNo + queryInclude);

            // let formGraphQL = [...this.lastformGraphQL]; //shallow-copy , its not nested, so its ok
            let formGraphQL = Object.assign(new FormGraphQl(), this.lastformGraphQL); //shallow-copy , its not nested, so its ok

            if (metaAll) {
                formGraphQL.attributes = "";
            }
            if (paginationNo) {
                formGraphQL.setLimit(null);
                formGraphQL.setOffset(null);
            }

            let query = formGraphQL.generateAndGetGraphQlCode();


            this.pSelector.find(".tquery-included").val(queryInclude);
            this.pSelector.find(".tquery").text(query);

            this.pSelector.find(".start-area").show(1000);
            this.pSelector.find(".init-area").hide(1000);

            // let body = "blub";
            //
            // var downloading = browser.downloads.download({
            //     url : "http://localhost:8080/api/export/download",
            //     filename : 'query-editor-output.json',
            //     method: "POST",
            //     body: body
            // });

        });

    }


}
