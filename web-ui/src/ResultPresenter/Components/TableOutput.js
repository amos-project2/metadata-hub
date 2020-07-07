import {datatables} from "datatables.net-bs4"



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
        this.pSelector=pSelector;

        this.pSelector.find('.exampleXX').DataTable();
    }

    updateState(formGraphQL) {

        //new installation
        this.pSelector.find('.myTableContainer').html(`
            <table class="exampleXX table table-striped table-bordered" style="width:100%">
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
            </table>`);

        this.pSelector.find('.exampleXX').DataTable( {
            "processing": true,
            "serverSide": true,
            "ajax": "http://localhost:8080/api/datatableAdapter/"
        });

    }



}
