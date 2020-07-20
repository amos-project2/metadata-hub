import {datatables} from "datatables.net-bs4"
import {Paginator} from "./Paginator";


export class TableOutput {


    constructor(resultPresenter, controllunits, viewModal) {
        this.resultPresenter = resultPresenter;
        this.controllunits = controllunits;
        this.viewModal = viewModal;
    }


    getMainHtmlCode() {
        return `
            <div class="myTableContainer">
                Only after sending a query first, you can get a result.
            </div>`;
    }

    onMount(pSelector) {
        this.pSelector = pSelector;
    }




    reinitialize(formGraphQL, initJson) {
        this.clearHtml();

    }


    clearHtml() {
        //new installation
        this.pSelector.find('.myTableContainer').html(`
                <div class="myTableMainContainer">
                </div>`
        );
    }

    cleanUp() {
        this.pSelector.find('.myTableContainer').html("");
        this.cleared = true;
    }

    /**
     * called by updateInternalState from Resultpresenter
     */
    updateState(formGraphQL, json) {

        let totalFiles = json.data.searchForFileMetadata.numberOfTotalFiles;
        let currentFiles = json.data.searchForFileMetadata.numberOfReturnedFiles;



        let data = [];
        let structure = [];//bitmap
        let structureReverseMap = [];
        let firstSeenCount = 0;


        let files = json.data.searchForFileMetadata.files;
        if (!files) {
            files = [];
        }

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

        this.controllunits.updateEntryCounter(formGraphQL, json, (Object.keys(structure).length - 2));

        for (var index in structure) {
            structureReverseMap[structure[index]] = index;
        }


        let headerAndFooter = "";
        let content = ""
        let headElement = "";
        let pointer = "";
        structureReverseMap.forEach(value => {
            if (value === "#") {
                headElement = "";
                pointer = "";
            } else {
                headElement = "head-element ";
                pointer = "cursor: pointer;"
            }
            headerAndFooter += `<th class="${headElement}" style="${pointer}" data-value="${value}">${value}</th>`;

        })


        let tmpContainer = "";

        data.forEach(value => {
            content += `<tr class="rel" data-rid="${value["id"]}" style="cursor: pointer">`;

            structureReverseMap.forEach(column => {
                tmpContainer = value[column];
                if (tmpContainer === undefined) tmpContainer = "NULL";
                content += `<td class="detail-view-element">${tmpContainer}</td>`;

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


        if (currentFiles === 0) {

            let emptyText = `<span class="text-success font-weight-bold">The Resultset is empty</span>`;
            this.pSelector.find('.myTableMainContainer').html(emptyText);
        } else {
            this.pSelector.find('.myTableMainContainer').html(myTable);
        }


        this.registerListener(formGraphQL, structureReverseMap);


    }

    registerListener(formGraphQL, structureReverseMap) {

        let thisdata = this;

        this.pSelector.find(".head-element").click(function () {

            let attribute = $(this).data("value");
            let sorting = formGraphQL.sortingIntern;

            if (sorting.asc && sorting.attribute === attribute) {
                formGraphQL.setSorting({attribute: attribute, asc: false});
            } else {
                formGraphQL.setSorting({attribute: attribute, asc: true});
            }

            thisdata.resultPresenter.sendToServerAndAdjust(formGraphQL);
        });

        this.pSelector.find(".rel").click(function () {
            let rowId = $(this).data("rid");
            let jqData = $(this).find("td");

            let dataArray = [];

            let counter = -1;
            jqData.each(function () {
                counter++;
                dataArray.push({
                    key: structureReverseMap[counter],
                    data: $(this).html()
                });
            });
            thisdata.viewModal.openModalWithData(rowId, dataArray);
        });


    }


}
