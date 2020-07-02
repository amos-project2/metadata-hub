//import {autocomplete} from "bootstrap-autocomplete";

var autocompleter = require('bootstrap-autocomplete');

/**
 * Its a high cohesive class to FormQueryEditor.
 * It depends on the dom, which is generated there.
 * So you cant use this class in an other context.
 */
export class MetadataAutocompletion {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }


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

    // get the Datatype of a given tag from the Server
    getDataType(tag) {

        let thisdata = this;
        let datatype;

        function getFileString() {

            let resultString = tag + "$XXX$";
            thisdata.fileTypes.forEach(element => {
                resultString += element + "$X$";
            });
            return resultString + "$XXX$";
        }

        let query = getFileString();
        console.log("Query? : " + query);
        this.restApiFetcherServer.fetchGet("metadata-autocomplete/datatype/?q=" + encodeURIComponent(getFileString()), function (event) {
            console.log("First Datatype: " + event.data.toString());
            datatype = event.data.toString();
            return datatype;
        });

        //This executes before Rest Call returns! so no useful value is returned
        console.log("SECOND");
        console.log("Returned Datatype: " + datatype);
        return datatype;

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

        $(".load-more-suggestions").click(function () {
            thisdata.loadMoreSuggestions();
        })

        this.clearCacheModalOpenerAndRequest();

        this.reAddListener();

    }

    //private
    getFileString() {

        let resultString = "";
        this.fileTypes.forEach(element => {
            resultString += element + "$X$";
        });

        if (resultString === "") resultString = " ";
        return resultString;
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


        $(this.currentFilterListSelector).not(".autocompleteAdded").autoComplete(autoCompleteBuilder("suggestions", value => {
            return value.trim() + "$XXX$" + getUsedAsString(0) + "$XXX$" + this.getFileString();
        }));


        $(this.currentMetadataListSelector).not(".autocompleteAdded").autoComplete(autoCompleteBuilder("suggestions", value => {
            return value.trim() + "$XXX$" + getUsedAsString(1) + "$XXX$" + this.getFileString();
        }));


        $(this.fileTypesSelector).autoComplete(autoCompleteBuilder("filetype-suggestions", value => {
            return value.trim() + "$XXX$" + this.getFileString();
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


        $(this.currentFilterListSelector).not(".autocompleteAdded").on('autocomplete.dd.shown', ddShown);
        $(this.currentFilterListSelector).not(".autocompleteAdded").on('autocomplete.dd.hidden', ddHidden);

        $(this.currentMetadataListSelector).not(".autocompleteAdded").on('autocomplete.dd.shown', ddShown);
        $(this.currentMetadataListSelector).not(".autocompleteAdded").on('autocomplete.dd.hidden', ddHidden);

        $(this.fileTypesSelector).not(".autocompleteAdded").on('autocomplete.dd.shown', ddShown);
        $(this.fileTypesSelector).not(".autocompleteAdded").on('autocomplete.dd.hidden', ddHidden);


        //show the autocomplete directly if the field is selected

        function showDirect() {
            if ($(this).hasClass("autocompleteDeactivated")) return;
            $(this).autoComplete('show');
        }

        $(this.currentFilterListSelector).not(".autocompleteAdded").focusin(showDirect);
        $(this.currentMetadataListSelector).not(".autocompleteAdded").focusin(showDirect);
        $(this.fileTypesSelector).not(".autocompleteAdded").focusin(showDirect);

        $(this.currentFilterListSelector).not(".autocompleteAdded").addClass("autocompleteAdded");
        $(this.currentMetadataListSelector).not(".autocompleteAdded").addClass("autocompleteAdded");
        $(this.fileTypesSelector).not(".autocompleteAdded").not(".autocompleteAdded").addClass("autocompleteAdded");


        // console.log(
        //     '$element events:',
        //     $._data($(this.currentFilterListSelector).get(0), 'events')
        // );

    }

    //private
    retrieveMetadataSuggestions(limit, offset, callback) {

        this.restApiFetcherServer.fetchGet(`metadata-autocomplete/modal-suggestions/?limit=${limit}&offset=${offset}&fileTypes=` + encodeURIComponent(this.getFileString()), function (event) {
            console.log(event.data);
            //this.bestMatchingFromServer = ["foo", "bar", "xyz", "usw"];
            //thisdata.bestMatchingFromServer = event.data;
            callback(event.data);
        });

    }


    //private
    openAndConfigureModal() {

        this.modalOffset = 0;

        let thisdata = this;
        // $(".metadata-autocompletion-suggestions-html").html();
        $(".load-more-suggestions").show();
        $(".metadata-autocompletion-suggestions-html").html(`
                 <div class ="sugesstion-waiter" >Please wait...</div>
                 <div class ="container suggestion-container">

                 </div>
            `);
        // this.retrieveMetadataSuggestions(20, this.modalOffset, function (data) {
        //     let initTable = thisdata.generateAndGetSuggestionTable(data);
        //     $(".metadata-autocompletion-suggestions-html").html(`
        //          <div class="container suggestion-container">
        //             ${initTable}
        //          </div>
        //     `);
        //     $(".adder-block").show(1000);
        //
        // });
        // this.modalOffset += 20;
        $('#metadata-autocompletion-modal').modal();
        setTimeout(function () {
            thisdata.loadMoreSuggestions();
        }, 200);

    }

    //private
    loadMoreSuggestions() {
        let thisdata = this;
        this.retrieveMetadataSuggestions(10, this.modalOffset, function (data) {
            $(".sugesstion-waiter").hide(700);
            if (data.length < 10) {
                $(".load-more-suggestions").hide(2000);
            }
            let htmlTable = thisdata.generateAndGetSuggestionTable(data);
            $(".suggestion-container").append(htmlTable);
            $(".adder-block").show(1000);

            $(".filter-adder").not(".listenerAdded").click(function () {
                let lastElement = $(".fg-metadata-attribute").last();

                lastElement.addClass("autocompleteDeactivated");
                lastElement.val($(this).data("adderto"));
                lastElement.trigger("focusin");
                lastElement.trigger("focusout");

                let jqThis = $(this);
                jqThis.parent().find(".filter-adder-message").show();
                jqThis.hide();

                setTimeout(function () {
                    jqThis.parent().find(".filter-adder-message").hide(600);
                    jqThis.show(600);
                    lastElement.removeClass("autocompleteDeactivated");
                }, 1000)


                //lastElement.removeClass("autocompleteDeactivated");

                //alert($(this).data("adderto"));
            });

            $(".metadata-adder").not(".listenerAdded").change(function () {

                let lastElement

                if ($(this).is(':checked')) {
                    lastElement = $(".attribut-element-input").last();
                    lastElement.val($(this).data("adderto"));
                    lastElement.addClass("autocompleteDeactivated");
                    lastElement.trigger("focusin");
                    lastElement.trigger("focusout");
                    lastElement.removeClass("autocompleteDeactivated");
                } else {
                    let jqThis = $(this);
                    $(".attribut-element-input").each(function () {
                        if ($(this).val().toLowerCase().trim() === jqThis.data("adderto").toLowerCase().trim()) {
                            $(this).val("");
                            lastElement = $(this);
                            lastElement.addClass("autocompleteDeactivated");
                            lastElement.trigger("focusin");
                            lastElement.trigger("focusout");
                            lastElement.removeClass("autocompleteDeactivated");
                        }
                    });
                }


            });

            $(".filter-adder").not(".listenerAdded").addClass("listenerAdded");
            $(".metadata-adder").not(".listenerAdded").addClass("listenerAdded");


        });
        this.modalOffset += 10;
    }


    generateAndGetSuggestionTable(data) {
        let result = `<div class="adder-block" style="display:none;">`;

        data.forEach(element => {
            let counter = MetadataAutocompletion.increaseCount();

            let checked = ``;
            this.metadata.forEach(element2 => {
                if (element.toLowerCase().trim() === element2.toLowerCase().trim()) {
                    checked = `checked`;
                }
            });

            // language=HTML
            result += `
                    <div class="row" style="margin-bottom: 8px;">
                        <div class="col-sm-6"">
                           ${element}
                        </div>
                        <div class="col-sm-3"">
                            <span class="filter-adder-message" style="display:none;">ADDED</span>
                            <button type="button" class="btn-primary filter-adder" data-adderto="${element}">ADD</button>
                        </div>
                        <div class="col-sm-3"">
                         <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input metadata-adder" data-adderto="${element}" id="adder-switch-${counter}" ${checked}>
                            <label class="custom-control-label" for="adder-switch-${counter}"> </label>
                         </div>

                        </div>
                    </div>
                `;
        });

        result += `</div>`;
        return result;
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
                            <button type="button" class="btn btn-success load-more-suggestions">Load more suggestions</button>

                        </div>
                    </div>
                </div>
            </div>`;
    }

    clearCacheModalOpenerAndRequest() {
        let thisdata = this;
        $(".modalClearCache").click(function () {
            $('#metadata-autocompletion-modal-clear-cache').modal();
            thisdata.restApiFetcherServer.fetchGet(`metadata-autocomplete/clear-cache/`, function (event) {});
        });
    }


    getStaticModalHtmlClearCache() {

        return `
            <div class="modal fade" id="metadata-autocompletion-modal-clear-cache" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Metadata Suggestions - Clear Cache</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            The Autocompletion-Cache is cleared automatically after each 60min. Now you forced to clear it.<br><br>
                            It was succesfully cleared.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>

                        </div>
                    </div>
                </div>
            </div>`;
    }


}
