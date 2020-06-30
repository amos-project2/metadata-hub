//import {autocomplete} from "bootstrap-autocomplete";

var autocompleter = require('bootstrap-autocomplete');

/**
 * Its a high cohesive class to FormQueryEditor.
 * It depends on the dom, which is generated there.
 * So you cant use this class in an other context.
 */
export class MetadataAutocompletion {

    constructor(restApiFetcherServer, graphQlFetcher, fileTypesSelector,
                currentFilterListSelector, currentMetadataListSelector, modalOpenerSelector) {
        this.restApiFetcherServer = restApiFetcherServer;
        this.graphQlFetcher = graphQlFetcher;
        this.fileTypesSelector = fileTypesSelector;
        this.currentFilterListSelector = currentFilterListSelector;
        this.currentMetadataListSelector = currentMetadataListSelector;
        this.modalOpenerSelector = modalOpenerSelector;

        this.fileTypes = [];
        this.filter = [];
        this.metadata = [];


        this.bestMatchingFromServer = [];
        this.lastFileTypesConcatenated = "UNDEFINED xxx";

    }

    //private
    //TODO rename and append also FileType
    updateListsFilterMetadata() {

        this.filter = [];
        this.metadata = [];
        this.fileTypes = [];

        let thisdata = this;

        $(this.currentFilterListSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.filter.push($(this).val());
        });

        $(this.currentMetadataListSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.metadata.push($(this).val());
        });

        $(this.fileTypesSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.fileTypes.push($(this).val());
        });

    }

    //private
    updateListFileType(callback) {

        //reset
        this.fileTypes = [];

        let thisdata = this;
        let tmpConcatenated = "";


        $(this.fileTypesSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.fileTypes.push($(this).val());
            tmpConcatenated += $(this).val();
        });

        if (tmpConcatenated !== this.lastFileTypesConcatenated) {
            this.lastFileTypesConcatenated = tmpConcatenated;
            this.updateServerList(callback);
        } else {
            callback();
        }

    }


    //private
    updateServerList(callback) {

        let thisdata = this;

        function getFileString() {

            let resultString = "";
            thisdata.fileTypes.forEach(element => {
                resultString += element + "$X$";
            });
            return resultString;
        }


        this.restApiFetcherServer.fetchGet("metadata-autocomplete/modal-suggestions/?fileTypes=" + encodeURIComponent(getFileString()), function (event) {
            console.log(event.data);
            //this.bestMatchingFromServer = ["foo", "bar", "xyz", "usw"];
            thisdata.bestMatchingFromServer = event.data;
            callback();
        });


    }

    //public
    showLists() {
        this.updateListFileType(function () {});
        this.updateListsFilterMetadata();
        alert(this.fileTypes);
        alert(this.filter);
        alert(this.metadata);
    }


    //public
    addListener() {

        let thisdata = this;

        $(this.modalOpenerSelector).click(function () {
            thisdata.openAndConfigureModal();
        });
        $(".save-metadata-autocompletion").click(function () {
            thisdata.saveModal();
        });

        this.reAddListener();

    }

    reAddListener() {

        let thisdata = this;

        function getUsedAsString(type) {

            let existing = thisdata.metadata
            if (type === 0) {
                existing = thisdata.filter;
            }

            let resultString = "";
            existing.forEach(element => {
                resultString += element + "$X$";
            });
            if (resultString === "") resultString = " ";
            return resultString;
        }

        function getFileString() {

            let resultString = "";
            thisdata.fileTypes.forEach(element => {
                resultString += element + "$X$";
            });

            if (resultString === "") resultString = " ";
            return resultString;
        }


        function autoCompleteBuilder(method, func) {
            return {
                preventEnter: true,
                minLength: 0,
                resolverSettings: {
                    url: 'http://localhost:8080/api/metadata-autocomplete/' + method,
                    requestThrottling: 100
                },
                events: {
                    searchPre: func
                }
            }
        }

        $(this.currentFilterListSelector).autoComplete(autoCompleteBuilder("suggestions", value => {
            return value.trim() + "$XXX$" + getUsedAsString(0) + "$XXX$" + getFileString();
        }));


        $(this.currentMetadataListSelector).autoComplete(autoCompleteBuilder("suggestions", value => {
            return value.trim() + "$XXX$" + getUsedAsString(1) + "$XXX$" + getFileString();
        }));

        $(this.fileTypesSelector).autoComplete(autoCompleteBuilder("filetype-suggestions", value => {
            return value.trim() + "$XXX$" + getFileString();
        }));


        function ddShown(event) {
            if ($(this).val() == "") {
                $(this).val(" ");
            }
        }

        function ddHidden(event) {
            if ($(this).val() == " ") {
                $(this).val("");
                $(this).trigger("focusout");
            }
            thisdata.reAddListener();
        }


        $(this.currentFilterListSelector).on('autocomplete.dd.shown', ddShown);
        $(this.currentFilterListSelector).on('autocomplete.dd.hidden', ddHidden);

        $(this.currentMetadataListSelector).on('autocomplete.dd.shown', ddShown);
        $(this.currentMetadataListSelector).on('autocomplete.dd.hidden', ddHidden);

        $(this.fileTypesSelector).on('autocomplete.dd.shown', ddShown);
        $(this.fileTypesSelector).on('autocomplete.dd.hidden', ddHidden);


        //show the autocomplete directly if the field is selected

        function showDirect() {
            $(this).autoComplete('show');
        }

        $(this.currentFilterListSelector).focusin(showDirect);
        $(this.currentMetadataListSelector).focusin(showDirect);
        $(this.fileTypesSelector).focusin(showDirect);


        // console.log(
        //     '$element events:',
        //     $._data($(this.currentFilterListSelector).get(0), 'events')
        // );

    }


    //private
    openAndConfigureModal() {
        $(".metadata-autocompletion-suggestions-html").html("Please wait...");
        this.updateListFileType(function () {
            $(".metadata-autocompletion-suggestions-html").html("coming soon...");
        });
        $('#metadata-autocompletion-modal').modal();
    }


    /**
     * type = 0 -> filter
     * type = 1 -> metadata
     */
    loadSuggestions(type, part, callback) {

        let existing = this.metadata
        if (type === 0) {
            existing = this.filter;
        }

        //load-stub
        callback(["fileName", "fileSize", "fileType"]);
    }


    saveModal() {
        //TODO
        alert("save Modal")
    }


    //public
    getStaticModalHtml() {

        return `
            <div class="modal fade" id="metadata-autocompletion-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Metadata Suggestions</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            Here you automatically add Metadataattributes to the filtersection and metadata-select-section.
                            <hr>
                            <div class="metadata-autocompletion-suggestions-html"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success save-metadata-autocompletion" data-dismiss="modal">Save</button>

                        </div>
                    </div>
                </div>
            </div>`;
    }

}
