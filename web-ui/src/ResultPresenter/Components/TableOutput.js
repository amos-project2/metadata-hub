import {datatables} from "datatables.net-bs4"
import {Paginator} from "./Paginator";


export class TableOutput {


    constructor() {

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

    updateState(formGraphQL) {
        let thisdata=this
        let paginator = new Paginator("tableOutput", 100, 1000, 1);
        paginator.registerPageListener(function (elem) {
            thisdata.pSelector.find('.paginator-container').html(elem.getHtmlCode());
            elem.addListener();

        });


        //new installation
        this.pSelector.find('.myTableContainer').html(`
<div class="row" style="margin:5px;">
<label class="col-form-label" > Show entries: </label>
    <div class="">
            <select name="example_length"  class="custom-select custom-select-sm form-control form-control-sm" >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
    </div>

</div>

<table class="exampleXX table table-striped table-bordered table-responsive" style="width:100%">
    <thead>
    <tr>
        <th>First name</th>
        <th>Last name</th>
        <th>Position</th>
        <th>Office</th>
        <th>Start date</th>
        <th>Salary</th>
    </tr>
    </thead>
    <tr>
        <td>Tiger Nixon</td>
        <td>System Architect</td>
        <td>Edinburgh</td>
        <td>61</td>
        <td>2011/04/25</td>
        <td>$320,800</td>
    </tr>


    <tfoot>
    <tr>
        <th>First name</th>
        <th>Last name</th>
        <th>Position</th>
        <th>Office</th>
        <th>Start date</th>
        <th>Salary</th>
    </tr>
    </tfoot>
</table>
<div class="paginator-container">
    ${paginator.getHtmlCode()}
</div>

`
        );

        paginator.addListener();

        // this.pSelector.find('.exampleXX').DataTable( {
        //     "processing": true,
        //     "serverSide": true,
        //     "ajax": "http://localhost:8080/api/datatableAdapter/"
        // });

    }


}
