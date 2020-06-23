/**
 * Its a high cohesive class to FormQueryEditor.
 * It depends on the dom, which is generated there.
 * So you cant use this class in an other context.
 */
export class MetadataAutocompletion {

    constructor(graphQlFetcher, fileTypesSelector, currentFilterListSelector, currentMetadataListSelector) {
        this.graphQlFetcher=graphQlFetcher;
        this.fileTypesSelector=fileTypesSelector;
        this.currentFilterListSelector = currentFilterListSelector;
        this.currentMetadataListSelector = currentMetadataListSelector;

        this.fileTypes = [];
        this.filter = [];
        this.metadata = [];
    }

    updateLists() {

        //reset
        this.fileTypes = [];
        this.filter = [];
        this.metadata = [];


        let thisdata = this;

        $(this.fileTypesSelector).each(function () {
            if($(this).val()==="") return;
            thisdata.fileTypes.push($(this).val());
        });

        $(this.currentFilterListSelector).each(function () {
            if($(this).val()==="") return;
            thisdata.filter.push($(this).val());
        });

        $(this.currentMetadataListSelector).each(function () {
            if($(this).val()==="") return;
            thisdata.metadata.push($(this).val());
        });
    }

    showLists() {
        this.updateLists();
        alert(this.fileTypes);
        alert(this.filter);
        alert(this.metadata);
    }



    getStaticModalHtml() {

    }

}
