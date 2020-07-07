import {datatables} from "datatables.net-bs4"



export class TableOutput {


    constructor() {

    }


    getMainHtmlCode() {
        return `<table class=" exampleXX table table-striped table-bordered" style="width:100%">
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Office</th>
                <th>Age</th>
                <th>Start date</th>
                <th>Salary</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Tiger Nixon</td>
                <td>System Architect</td>
                <td>Edinburgh</td>
                <td>61</td>
                <td>2011/04/25</td>
                <td>$320,800</td>
            </tr>
             <tr>
                <td>2-Tiger Nixon</td>
                <td>2- System Architect</td>
                <td>2- Edinburgh</td>
                <td>2- 61</td>
                <td>2- 2011/04/25</td>
                <td>2- $320,800</td>
            </tr>
        </tfoot>
    </table>`;
    }


    onMount(pSelector) {
        this.pSelector=pSelector;

        this.pSelector.find('.exampleXX').DataTable();
    }



}
