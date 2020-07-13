import {FormGraphQl} from "../../query/FormQueryEditor/Components/FormGraphQl";

export class DetailViewModal {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }


    constructor(graphQlFetcher) {
        this.graphQlFetcher = graphQlFetcher;
        this.id = "detail-view-modal-" + DetailViewModal.increaseCount();
        this.pSelector = $("#" + this.id);

    }

    //public
    getHtmlCode() {
        // language=HTML
        return `
            <div class="modal fade" id="${this.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detailed Dataview</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="detail-view-html"></div>
                            <div class="detail-view-html2"></div>
                            <div class="detail-view-data" style="display:none;"></div>

                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" class="closedetailview">Close</button>
                            <button type="button" class="btn btn-success load-full-dataset">Load full Dataset</button>

                        </div>
                    </div>
                </div>
            </div>`;

    }

    //public
    openModal() {
        this.pSelector.modal();
    }

    getContentSelector() {
        return this.pSelector.find(".detail-view-html");
    }

    getLoadFullDataset() {
        return this.pSelector.find(".load-full-dataset");
    }

    onMount() {
        let thisdata = this;

        this.pSelector = $("#" + this.id);

        this.pSelector.find(".closedetailview").click(function () {
            this.pSelector.find(".detail-view-html").html();
            this.pSelector.find(".detail-view-html2").html();
        });

        this.pSelector.find(".load-full-dataset").click(function () {
            $(this).hide(1000);
            thisdata.loadFullDataset();
        });

    }


    openModalWithData(id, data) {

        console.log(data);

        this.pSelector.find(".detail-view-html").hide();
        this.pSelector.find(".detail-view-data").html(id);
        this.pSelector.find(".detail-view-html2").html("");
        this.pSelector.find(".detail-view-html").html("");
        this.pSelector.find(".detail-view-html2").hide();
        this.pSelector.find(".load-full-dataset").show();

        let htmlCode = ``;

        data.forEach(value => {
            htmlCode += this.generateTableViewElement(value.key, value.data);
        })

        this.pSelector.find(".detail-view-html").html(htmlCode);
        setTimeout(() => {
            this.pSelector.find(".detail-view-html").show(1000);
        }, 200);


        this.openModal();
    }

    loadFullDataset() {
        let thisdata = this;
        this.pSelector.find(".detail-view-html").hide(1000);
        let rowId = this.pSelector.find(".detail-view-data").html();

        let formGraphQl = new FormGraphQl();
        formGraphQl.setId(rowId);

        let query = formGraphQl.generateAndGetGraphQlCode();
        this.graphQlFetcher.fetchAdvanced(query, function (sucess, json, jsonString) {

            if (sucess) {

                let files = json.data.searchForFileMetadata.files;
                let keysOfFiles = Object.keys(files);

                let htmlCode = ``;

                files.forEach(file => {

                    let keysOfFile = Object.keys(file);

                    keysOfFile.forEach(value => {
                        if (value !== "metadata") {
                            htmlCode += thisdata.generateTableViewElement(value, file[value]);
                        }
                    })
                    htmlCode += "<br><hr><br>";

                    file.metadata.forEach(value => {
                        htmlCode += thisdata.generateTableViewElement(value.name, value.value);
                    })
                });

                let viewHtml2 = thisdata.pSelector.find(".detail-view-html2")
                viewHtml2.html(htmlCode);
                viewHtml2.show(1000);
            } else {
                this.pSelector.find(".detail-view-html2").html(`There was an error while fetching the detailed data`);
                this.pSelector.find(".detail-view-html2").show(1000);
            }

        });


    }

    generateTableViewElement(name, content) {

        // language=HTML
        return `
                    <div class="row detail-view-element" style="margin-bottom: 8px; word-wrap: break-word;">
                        <div class="col-sm-6"">
                           ${name}
                        </div>
                        <div class="col-sm-6"">
                             ${content}
                        </div>

                    </div>
                `;


    }


}
