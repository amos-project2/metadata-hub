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
        this.pSelector.find('.myTableContainer').html(` <table class=" exampleXX table table-striped table-bordered" style="width:100%"></table>`);
        this.pSelector.find('.exampleXX').DataTable();

    }



}
