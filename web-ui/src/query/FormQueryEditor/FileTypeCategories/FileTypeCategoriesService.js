import {FileTypeCategoriesModal} from "./FileTypeCategoriesModal";

export class FileTypeCategoriesService {

    constructor() {

        this.fileTypeCategoriesModal = new FileTypeCategoriesModal();

    }


    getModalHtml() {
        return this.fileTypeCategoriesModal.getHtmlCode();
    }
}
