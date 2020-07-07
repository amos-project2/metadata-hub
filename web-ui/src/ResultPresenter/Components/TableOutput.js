export class TableOutput {


    constructor() {

    }

    getMainHtmlCode() {
        return `table-output`;
    }

    onMount(pSelector) {
        this.pSelector=pSelector;
    }

}
