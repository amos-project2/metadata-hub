export class ExportOutput {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }

    constructor() {
        this.id = "export-" + ExportOutput.increaseCount();
        this.pSelector = null;
    }

    getMainHtmlCode() {
        // language=HTML
        return `
            <hr>
            <div id="${this.id}">
                <br>
                <div class="mx-auto" style="width: 290px;">
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" value="" id="meta-all${this.id}">
                        <label class="form-check-label" for="meta-all${this.id}">
                            Include all Metadataattributes <br>(Ignore the Metadataattributes-Filter)
                        </label>
                    </div>
                     <div class="form-check mb-4" id="${this.id}">
                        <input class="form-check-input" type="checkbox" value="" id="pagination-no${this.id}">
                        <label class="form-check-label" for="pagination-no${this.id}">
                            Include all rows <br>(Ignore pagination)
                        </label>
                    </div>
                    <div class="form-check mb-4" id="${this.id}">
                        <input class="form-check-input" type="checkbox" value="" id="query-include${this.id}">
                        <label class="form-check-label" for="query-include${this.id}">
                           Include the query
                        </label>
                    </div>
                    <div class="col text-center mb-4">
                        <button type="button" class="btn btn-success download-button ">Download</button>
                    </div>
                </div>
                <br>
            </div>
            <hr>`;
    }

    onMount(pSelectorParent) {
        this.pSelector = $("#" + this.id);

        this.pSelector.find(".download-button").click(() => {

            let metaAll = this.pSelector.find(`#meta-all${this.id}`).prop('checked');
            let paginationNo = this.pSelector.find(`#pagination-no${this.id}`).prop('checked');
            let queryInclude = this.pSelector.find(`#query-include${this.id}`).prop('checked');

            if (metaAll) metaAll = true; else metaAll = false;
            if (paginationNo) paginationNo = true; else paginationNo = false;
            if (queryInclude) queryInclude = true; else queryInclude = false;

            alert(metaAll + paginationNo + queryInclude);

        });

    }


}
