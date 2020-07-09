import {datatables} from "datatables.net-bs4"
import {Paginator} from "./Paginator";


export class TableOutput {


    constructor(resultPresenter) {
        this.resultPresenter = resultPresenter;
        this.initializeId = 0;
        this.cleared = true;
        this.lastTotalFiles = -1;

    }


    getMainHtmlCode() {
        return `
            <div class="myTableContainer">
                Send a Query first, then you get the Result.
            </div>`;
    }

    cleanHttml() {
        this.pSelector.find('.myTableContainer').html("");
        this.cleared = true;
    }

    waitForLoadHtml() {
        this.pSelector.find('.myTableContainer').html(`
        <div class="spinner-border text-primary" role="status">
             <span class="sr-only">Loading...</span>
        </div>`);
    }

    showError(error) {
        this.pSelector.find('.myTableContainer').html(`
            <div style="color=red">
                <b>Error: ${error.message}</b><br><br>
                Info: ${error.info}
            </div>`);
    }


    onMount(pSelector) {
        this.pSelector = pSelector;

        //this.pSelector.find('.exampleXX').DataTable();
    }

    reinitialize(formGraphQL, initJson) {
        let thisdata = this;


        let totalFiles = initJson.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = initJson.data.searchForFileMetadata.numberOfReturnedFiles;

        this.lastTotalFiles = totalFiles;
        this.cleared = false;


        let paginator = new Paginator("tableOutput", 2, totalFiles, 1);
        paginator.registerPageListener(function (elem) {
            thisdata.pSelector.find('.paginator-container').html(elem.getHtmlCode());
            elem.addListener();

            formGraphQL.setOffset(elem.startIndex);
            formGraphQL.setLimit(elem.countElementsPerPage);
            thisdata.resultPresenter.sendToServerAndAdjust(formGraphQL);

        });


        //new installation
        this.pSelector.find('.myTableContainer').html(`
                <div class="row" style="margin:5px;">
                <label class="col-form-label" > Show entries: </label>
                    <div class="">
                            <select name="length"  class="custom-select custom-select-sm form-control form-control-sm myTableLength" >
                                <option value="2" selected>2</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                    </div>

                </div>
                <div class="myTableMainContainer">

                </div>
                <div class="paginator-container">
                    ${paginator.getHtmlCode()}
                </div>
                Entries: <span class="myEntryCount">load...</span>
`
        );

        paginator.addListener();

        this.pSelector.find('.myTableLength').change(function () {
            paginator.setElementsPerPage($(this).val());

        })


    }

    updateState(formGraphQL, json) {

        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;

        if (this.cleared || this.lastTotalFiles !== totalFiles) this.reinitialize(formGraphQL, json);


        let data = [];
        let structure = [];//bitmap
        let structureReverseMap = [];
        let firstSeenCount = 0;

        // console.log(json.data.searchForFileMetadata.files[0]);
        // console.log(json.data.searchForFileMetadata.files[0].metadata[0]);
        // alert(json.data.searchForFileMetadata.files[0].metadata[0]);
        //alert(json.data.searchForFileMetadata.files[0].metadata[0].name);

        let files = json.data.searchForFileMetadata.files;

        structure["#"] = firstSeenCount;
        firstSeenCount++;
        structure["id"] = firstSeenCount;
        firstSeenCount++;


        let counter = formGraphQL.getOffset();
        files.forEach(file => {

            let tmp = []

            file.metadata.forEach(metadata => {
                if (structure[metadata.name] === undefined) {
                    structure[metadata.name] = firstSeenCount;
                    firstSeenCount++;
                }
                tmp[metadata.name] = metadata.value;

            });

            counter++;
            tmp["#"] = "<b>" + counter + "</b>";

            tmp["id"] = file.id;


            //"s"+file.id
            data.push(tmp);
        });

        let offsetLimit = formGraphQL.getOffset() + formGraphQL.getLimit();
        this.pSelector.find('.myEntryCount').html(`<b>${formGraphQL.getOffset() + 1} - ${offsetLimit} [${currentFiles}] from ${totalFiles}</b> | Metadatacolumns: ${Object.keys(structure).length - 2}`);


        for (var index in structure) {
            structureReverseMap[structure[index]] = index;
        }

        // structure.forEach(value => {
        //     console.log(value);
        //     structureReverseMap[value] = index;
        // })


        let headerAndFooter = "";
        let content = ""
        structureReverseMap.forEach(value => {
            headerAndFooter += `<th>${value}</th>`;

        })


        let tmpContainer = "";

        data.forEach(value => {
            content += "<tr>";

            structureReverseMap.forEach(column => {
                tmpContainer = value[column];
                if (tmpContainer === undefined) tmpContainer = "NULL";
                content += `<td>${tmpContainer}</td>`;

            });

            content += "</tr>";

        })


        let myTable = `
        <table class="exampleXX table table-striped table-bordered table-responsive table-hover" style="width:100%">
            <thead>
            <tr>
                ${headerAndFooter}
            </tr>
            </thead>
                ${content}
            <tfoot>
            <tr>
               ${headerAndFooter}
            </tr>
            </tfoot>
        </table>
        `;

        this.pSelector.find('.myTableMainContainer').html(myTable);

    }


}
