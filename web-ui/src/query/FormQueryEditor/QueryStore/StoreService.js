import {SaveModal} from "./Modals/SaveModal";

export class StoreService {

    constructor(queryEditor, restApiFetcherServer) {
        this.queryEditor = queryEditor;
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

        this.restApiFetcherServer.fetchJson("saveenginge",sendData, function (event) {
            console.log(event.data);
            console.log("hey");
        });

        return true;

    }

    restoreEditor() {

    }

    getSaveModal() {
        return this.saveModal;
    }

}
