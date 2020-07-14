import {SaveModal} from "./Modals/SaveModal";
import {FetchResult} from "../../../libs/Fetcher/RestAPIFetcher";

export class StoreService {

    constructor(queryEditor, queryStore, restApiFetcherServer) {
        this.queryEditor = queryEditor;
        this.queryStore = queryStore;
        this.restApiFetcherServer = restApiFetcherServer;
        this.lastSavedData = null;
        this.saveModal = new SaveModal();
    }

    saveEditor() {

        let data = {};

        //let multiplierList={}

        let author = $(".save-author").val();

        $(".save-element").each(function () {


            if (data[$(this).data("name")] === undefined) {
                data[$(this).data("name")] = [];
            }
            let tmp = $(this).val();
            if ($(this).attr("type") === "checkbox") {
                tmp = ($(this).prop('checked'));
            }
            data[$(this).data("name")].push(tmp);

            // if ($(this).data("multiplier") === "true") {
            //
            // } else {
            //     data[$(this).data("name")]=$(this).val();
            // }

        });

        if (JSON.stringify(this.lastSavedData) === JSON.stringify(data)) {
            return false;
        }

        this.lastSavedData = data;
        let sendData = {author: author, data: data};
        console.log(sendData);


        this.storeQuery(sendData);

        // this.restApiFetcherServer.fetchJson("saveenginge", sendData, function (event) {
        //     console.log(event.data);
        //     console.log("hey");
        // });

        return true;

    }

    restoreEditor() {

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
                if (successFunc) successFunc(event.data());
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
