import {SuggestionViewerModal} from "./Modals/SuggestionViewerModal";

export class SuggestionViewer {

    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }




    constructor(metadataAutocompletion, restApiFetcherServer, suggestionWindowOpenerSelector) {

        //cyclic dependency, but no cyclic flow
        this.metadataAutocompletion = metadataAutocompletion

        this.restApiFetcherServer = restApiFetcherServer;
        this.suggestionWindowOpenerSelector = suggestionWindowOpenerSelector;
        this.suggestionViewerModal = new SuggestionViewerModal();
    }

    //public
    //delegate
    getStaticModalHtml() {
        return this.suggestionViewerModal.getHtmlCode();
    }

    //public
    addListener() {
        let thisdata = this;
        $(this.suggestionWindowOpenerSelector).click(function () {
            thisdata.openAndConfigureModal();
        });

        $(".load-more-suggestions").click(function () {
            thisdata.loadMoreSuggestions();
        });
    }

    //private
    retrieveMetadataSuggestions(limit, offset, callback) {

        this.restApiFetcherServer.fetchGet(`metadata-autocomplete/modal-suggestions/?limit=${limit}&offset=${offset}&fileTypes=` + encodeURIComponent(this.metadataAutocompletion.getFileString()), function (event) {
            callback(event.data);
        });

    }


    //private
    openAndConfigureModal() {

        this.modalOffset = 0;

        let thisdata = this;
        this.suggestionViewerModal.getLoadMoreSelector().show();
        this.suggestionViewerModal.getContentSelector().html(`
                 <div class ="sugesstion-waiter" >Please wait...</div>
                 <div class ="container suggestion-container">

                    <div class="row" style="margin-bottom: 15px;">
                        <div class="col-sm-6"">
                           <b>Metadata Attribute</b>
                        </div>
                        <div class="col-sm-3"">
                          <b>Filters</b>
                        </div>
                        <div class="col-sm-3"">

                          <b>Return</b>


                        </div>
                    </div>

                 </div>
            `);

        this.suggestionViewerModal.openModal();
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
                thisdata.suggestionViewerModal.getLoadMoreSelector().hide(2000);
            }
            let htmlTable = thisdata.generateAndGetSuggestionTable(data);
            $(".suggestion-container").append(htmlTable);
            $(".adder-block").show(1000);

            let refParent = thisdata.metadataAutocompletion;


            $(".filter-adder").not(".listenerAdded").click(function () {
                refParent.advancedFilter.inputMultiplierAdvancedFilterRows.addInputValue($(this).data("adderto"), "autocompleteDeactivated");

                let jqThis = $(this);
                jqThis.parent().find(".filter-adder-message").show();
                jqThis.hide();

                setTimeout(function () {
                    jqThis.parent().find(".filter-adder-message").hide(600);
                    jqThis.show(600);

                    }, 1000)

            });

            $(".metadata-adder").not(".listenerAdded").change(function () {

                if ($(this).is(':checked')) {

                    refParent.attributSelector.inputMultiplierAttributSelector.addInputValue($(this).data("adderto"), "autocompleteDeactivated");

                } else {

                    refParent.attributSelector.inputMultiplierAttributSelector.deleteInputValue($(this).data("adderto"), "autocompleteDeactivated");
                }

            });

            $(".filter-adder").not(".listenerAdded").addClass("listenerAdded");
            $(".metadata-adder").not(".listenerAdded").addClass("listenerAdded");


        });
        this.modalOffset += 10;
    }

    //private
    generateAndGetSuggestionTable(data) {
        let result = `<div class="adder-block" style="display:none;">`;

        data.forEach(element => {
            let counter = SuggestionViewer.increaseCount();

            let checked = ``;
            this.metadataAutocompletion.metadata.forEach(element2 => {
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

}
