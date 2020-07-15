import {FileTypeCategoriesModal} from "./FileTypeCategoriesModal";

export class FileTypeCategoriesService {

    constructor(restApiFetcherServer) {

        this.fileTypeCategoriesModal = new FileTypeCategoriesModal();
        this.restApiFetcherServer = restApiFetcherServer;

        this.fileTypes = [];
    }

    getModalHtml() {
        return this.fileTypeCategoriesModal.getHtmlCode();
    }

    // get all the file categories and their corresponding file types from the server
    getAllFileCategories(callback) {

        let autocompletionClass = this;

        this.restApiFetcherServer.fetchGet("categoryService/", function (event) {
            let fileCategories = event.data;
            callback(fileCategories);
        });
    }

    // get all the file categories and their corresponding file types from the server
    createCategory(category, callback) {
        this.updateLists();

        let thisdata = this;

        function getFileString() {

            let resultString = "";
            thisdata.fileTypes.forEach(element => {
                resultString += element + "$x$";
            });
            console.log(resultString);
            return resultString;
        }

        console.log("!! " + getFileString() + " ? " + category);

        this.restApiFetcherServer.fetchPost("categoryService/admin/" + category + "/?file_types=" + encodeURIComponent(getFileString()), ":)", function (event) {
            let success = event.data;
            callback(success);
        });
    }

    deleteCategory(category, callback){
        let thisdata = this;
        this.restApiFetcherServer.restDelete("categoryService/admin/" + category, function (event) {
            let success = event.data;
            callback(success);
        });

    }

    //private
    updateLists() {

        this.fileTypes = [];

        let thisdata = this;

        $(this.fileTypesSelector).each(function () {
            if ($(this).val() === "") return;
            thisdata.fileTypes.push($(this).val());
        });
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
    }
}
