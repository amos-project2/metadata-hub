import {SaveModal} from "./Modals/SaveModal";
import {FetchResult} from "../../../libs/Fetcher/RestAPIFetcher";

export class StoreService {

    constructor(queryEditor, queryStore, restApiFetcherServer) {
        this.queryEditor = queryEditor;
        this.queryStore = queryStore;
        this.restApiFetcherServer = restApiFetcherServer;
        this.lastSavedData = null;
        this.saveModal = new SaveModal();

        this.injectIntoQueryEditor = false;
    }

    saveEditor(saveToServer) {

        let data = {};

        let author = $(".save-author").val();
        let title = $(".save-title").val();

        $(".save-element").each(function () {


            if (data[$(this).data("name")] === undefined) {
                data[$(this).data("name")] = [];
            }
            let tmp = $(this).val();
            if ($(this).attr("type") === "checkbox") {
                tmp = ($(this).prop('checked'));
            }
            data[$(this).data("name")].push(tmp);

        });

        let savedTmp = JSON.stringify(JSON.parse(JSON.stringify(this.lastSavedData)));
        let refTmp = JSON.stringify(JSON.parse(JSON.stringify(data)));

        console.log("START EUQALITY-CHECK");
        console.log(savedTmp);
        console.log(refTmp);
        console.log("END EUQALITY-CHECK");


        if (savedTmp === refTmp) {
            return false;
        }

        this.lastSavedData = data;
        let sendData = {author: author, title: title, data: data};
        console.log(sendData);

        if (saveToServer) {
            this.storeQuery(sendData);
        }


        return true;

    }

    restoreEditor(id) {
        this.getStoredQuery(id, (data) => {
            console.log(data.data);
            console.log("HAAHAHAHAHA");
            this.lastSavedData = JSON.parse(data.data);
            this.injectIntoQueryEditor = true;

            $("#nav-element-query-editor").trigger("click");
        });
    }

    doRestoringLastSave() {
        this.injectIntoQueryEditor = false;

        let data = this.lastSavedData;

        console.log("keys-start");
        let keys = Object.keys(data);
        console.log(keys);
        console.log("keys-end");

        keys.unshift("f4"); //QUICK-FIX
        let isF4 = false;

        let countAll = 0;
        keys.forEach(value => {
            let dataArr = data[value];
            dataArr.forEach(value2 => {
                countAll++;
            });
        });

        let time = Math.ceil(5000 / countAll);

        countAll = 0
        keys.forEach(value => {
                if (isF4 && value === "f4") {
                    //nothing
                } else {


                    isF4 = true;
                    let dataArr = data[value];
                    console.log(dataArr);

                    let counter = -1;
                    dataArr.forEach(value2 => {
                            counter++;
                            let selector = $(`[data-name="${value}"]`).eq(counter);

                            if (selector.attr("type") === "checkbox") {
                                selector.prop("checked", value2);
                            } else {

                                selector.val(value2).change();
                                selector.addClass("autocompleteDeactivated");
                                selector.trigger("focusin");
                                selector.trigger("focusout");
                                selector.removeClass("autocompleteDeactivated");

                            }
                        }
                    )

                }

            }
        )


    }

    getSaveModal() {
        return this.saveModal;
    }


//server-api-methods

    //private
    //higher-order-function/method
    helperMethod(successFunc, errorFunc, completeCallback) {

        return function (event) {
            if (event.status === FetchResult.SUCCESS()) {
                if (successFunc) successFunc(event.data);
            } else {
                if (errorFunc) errorFunc(event.status)
            }
            if (completeCallback) completeCallback(event);
        }
    }


    getAllStoredQueriesMetadata(successFunc, errorFunc, completeCallback) {

        this.restApiFetcherServer.fetchGet("query-storage/get-all-stored-queries-metadata/", this.helperMethod(successFunc, errorFunc, completeCallback));

    }

    getStoredQuery(id, successFunc, errorFunc, completeCallback) {

        this.restApiFetcherServer.fetchGet("query-storage/get-stored-queries-metadata/?id=" + id, this.helperMethod(successFunc, errorFunc, completeCallback));

    }

    storeQuery(jsonData, successFunc, errorFunc, completeCallback) {

        this.restApiFetcherServer.fetchJson("query-storage/store-query/", jsonData, this.helperMethod(successFunc, errorFunc, completeCallback));

    }

    deleteQuery(id, successFunc, errorFunc, completeCallback) {

        let formData = new FormData();
        formData.append("id", id);
        this.restApiFetcherServer.fetchPost("query-storage/delete-query", formData, this.helperMethod(successFunc, errorFunc, completeCallback));

    }

    deleteAllQuery(successFunc, errorFunc, completeCallback) {

        let formData = new FormData();
        this.restApiFetcherServer.fetchPost("query-storage/delete-all-query", formData, this.helperMethod(successFunc, errorFunc, completeCallback));
    }

//end server-api-methods

}
