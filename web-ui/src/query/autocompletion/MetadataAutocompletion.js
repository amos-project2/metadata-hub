export class MetadataAutocompletion {

    constructor(graphQlFetcher, fileTypesSelector, currentFilterListSelector, currentMetadataListSelector) {
        this.graphQlFetcher=graphQlFetcher;
        this.fileTypesSelector=fileTypesSelector;
        this.currentFilterListSelector = currentFilterListSelector;
        this.currentMetadataListSelector = currentMetadataListSelector;
    }

    getStaticModalHtml() {

    }

}
