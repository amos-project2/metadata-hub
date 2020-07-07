export class ExportOutput {


    constructor() {

    }

    getMainHtmlCode() {
        return `export-output`;
    }

    onMount(pSelector) {
        this.pSelector=pSelector;
    }

}
