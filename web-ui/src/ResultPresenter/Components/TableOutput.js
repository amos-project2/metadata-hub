import {datatables} from "datatables.net-bs4"
import {Paginator} from "./Paginator";


export class TableOutput {


    constructor(resultPresenter) {
        this.resultPresenter = resultPresenter;

    }


    getMainHtmlCode() {
        return `
            <div class="myTableContainer">
                Send first a Query, then you get the Resulttable.
            </div>`;
    }


    onMount(pSelector) {
        this.pSelector = pSelector;

        //this.pSelector.find('.exampleXX').DataTable();
    }

    reinitialize(formGraphQL) {
        let thisdata = this
        let paginator = new Paginator("tableOutput", 2, 1000, 1);
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

`
        );

        paginator.addListener();

        this.pSelector.find('.myTableLength').change(function () {
            paginator.setElementsPerPage($(this).val());

        })


    }

    updateState(json) {

        let data = [];
        let structure = [];//bitmap
        let structureReverseMap = [];
        let firstSeenCount = 0;

        // console.log(json.data.searchForFileMetadata.files[0]);
        // console.log(json.data.searchForFileMetadata.files[0].metadata[0]);
        // alert(json.data.searchForFileMetadata.files[0].metadata[0]);
        //alert(json.data.searchForFileMetadata.files[0].metadata[0].name);

        let files = json.data.searchForFileMetadata.files;

        structure["id"] = firstSeenCount;
        firstSeenCount++;

        files.forEach(file => {

            let tmp = []

            file.metadata.forEach(metadata => {
                if (structure[metadata.name] === undefined) {
                    structure[metadata.name] = firstSeenCount;
                    firstSeenCount++;
                }
                tmp[metadata.name] = metadata.value;

            })

            tmp["id"] = file.id;


            //"s"+file.id
            data.push(tmp);
        })


        for(var index in structure) {
            structureReverseMap[structure[index]] = index;
        }

        // structure.forEach(value => {
        //     console.log(value);
        //     structureReverseMap[value] = index;
        // })



        let headerAndFooter = "";
        let content=""
        structureReverseMap.forEach(value => {
            headerAndFooter += `<th>${value}</th>`;

        })


        let tmpContainer="";

        data.forEach(value => {
            content +="<tr>";

            structureReverseMap.forEach(column => {
                tmpContainer = value[column];
                if(tmpContainer===undefined) tmpContainer="NULL";
                content +=`<td>${tmpContainer}</td>`;

            });

            content +="</tr>";

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
