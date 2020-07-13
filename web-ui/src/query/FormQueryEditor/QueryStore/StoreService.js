export class StoreService {

    constructor(queryEditor) {
        this.queryEditor = queryEditor;
        this.lastSavedData = null;
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

        //TODO send

        return true;

    }

    restoreEditor() {

    }

}
