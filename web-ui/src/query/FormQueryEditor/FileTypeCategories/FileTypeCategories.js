import {Page} from "../../../Page";
import {FileTypeCategoriesService} from "./FileTypeCategoriesService";
import {MetadataAutocompletion} from "../autocompletion/MetadataAutocompletion";
import {FiletypeFilter} from "../Components/FiletypeFilter";
import {InputFieldMultiplier} from "../../../Utilities/InputFieldMultiplier";
import {FileTypeCategoriesModal} from "./FileTypeCategoriesModal";


export class FileTypeCategories extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "File Type Categories";
        this.cacheLevel = 3;

        this.modal = new FileTypeCategoriesModal();

        this.fileTypeCategoriesService = new FileTypeCategoriesService(this.parent.dependencies.restApiFetcherServer);
        this.inputMultiplierFiletypeFilter = this.inputMultiplierFiletypeFilterBuilder();
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;

        this.metadatAutocompletion = new MetadataAutocompletion(
            this.parent.dependencies.restApiFetcherServer,
            this.graphQlFetcher,
            ".filetype-element-input2",
            ".null",
            ".null",
            ".null",
        );

        //this.filetypeFilter = new FiletypeFilter(this.metadatAutocompletion);
    }

    content() {
        return `

                ${this.modal.getHtmlCode()}

                <br>
                File Type Categories are used to group multiple file types in one category.</br>
                The File Type Categories can get selected in the Query-Editor.
                <br>
                <br>
                <!--     file-category-selector       -->
                <div class="form-group col-md-12 ">
                <div class="form-row justify-content-md-center">
                    <button type="button" id="file-category-button2" class="btn btn-primary mr-3" data-toggle="modal" data-target="#file-categories-modal2">
                        All File Type Categories
                    </button>
                </div>
                    </br>


                    <!-- file-category-manipulation-buttons -->
                    <div class="form-row justify-content-md-center">
                    <button type="button" id="create-category-button" class="btn btn-primary mr-3">
                        Create File Category
                    </button>
                    <button type="button" id="update-category-button" class="btn btn-primary mr-3">
                        Update File Category
                    </button>
                    <button type="button" id="delete-category-button" class="btn btn-danger mr-3">
                        Delete File Category
                    </button>
                    </div>

                    </br>



                     <div class="form-group">
                            File Category
                            <a class="pover" title="File Type Categories" data-content="Enter a name for the creation or deletion of a File Category. When creating a File Category the File Types below are used.">[?]</a>
                        <input type="text" class="form-control" id="createCategoryForm" aria-describedby="createCategoryHelp" placeholder="File Category Name">
                        <small id="createCategoryHelp" class="form-text text-muted">Enter a File Category Name</small>
                     </div>
                </div>

                <!-- file-categories-modal2 -->
                <div class="modal fade" id="file-categories-modal2" tabindex="-1" role="dialog" aria-labelledby="file-categories-label" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="file-categories-label">
                                    File Type Categories
                                </h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="file-categories-modal2-body">
                            No Categories available :(
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

        <!--     filetypes            -->
         <div class="form-row">
            <div class="col-md-12">
                <div class="form-group col-md-12">

                    <div class="form-row justify-content-md-center">
                    <button type="button" id="delete-types-button2" class="btn btn-danger justify-content-md-center">
                        Clear File Types
                    </button>
                    </div>

                    </br>


                    File Types
                    <a class="pover" title="Filetypes" data-content="Here it is possible to select file types which can be added to a file category">[?]</a>


                      <div class="fg-filetype-container2 form-row">

                         ${this.inputMultiplierFiletypeFilter.getFirstElement()}

                        </div>



                </div>
            </div>
         </div>

        <div class="form-row">
            <div class="col-md-12">
                <hr>
            </div>
        </div>
        `;
    }

    onMount() {
        let thisdata = this;

        //this.filetypeFilter.onMount();

        this.metadatAutocompletion.addListener();
        this.inputMultiplierFiletypeFilter.listenerAdd();


        //Activate File Category Modal Pop-Up Window
        $("#file-category-button2").click(function () {
            thisdata.fileTypeCategoriesService.getAllFileCategories(function (fileCategoryMap) {

                console.log(fileCategoryMap);

                if (fileCategoryMap == undefined) {
                    return;
                }

                $("#file-categories-modal2-body").html("Click on a file type category to add it into the selection, where you can then update or delete the file type category.<br/>" +
                    "Or you can delete a file type category directly.<br/><br>" +
                    "<b>File Type Categories:</b><br><br>")

                let counter = -1;
                Object.keys(fileCategoryMap).forEach(key => {
                    counter++;

                    let fileCategoryString = "";
                    fileCategoryMap[key].forEach(value => {
                        fileCategoryString += value + ", ";
                    });
                    fileCategoryString = fileCategoryString.substr(0, fileCategoryString.length - 2);


                    // $("#file-categories-modal2-body").append("<button type=\"button\" class=\"btn btn-primary\" id='button-"+ key + "' data-dismiss=\"modal\"><b>" + key + "</b></button>" +
                    //     "<button type=\"button\" id=\"delete" + key + "\" class=\"btn btn-danger\" data-dismiss=\"modal\"> delete </button> <br/>");
                    // $("#file-categories-modal2-body").append("<b>File Types:</b> " + "<br\>" + fileCategoryMap[key] + "<br/><br/>");

                    $("#file-categories-modal2-body").append(`
                        <div class="row mb-3 detail-view-element">
                            <div class="col font-weight-bold">${key}</div>
                             <div class="col">${fileCategoryString}</div>
                             <div class="col-2"><button type="button" class="btn btn-primary btn-sm" id='button-${counter}' data-dismiss="modal">apply</button></div>
                             <div class="col-3"><button type="button" id="delete-${counter}" class="btn btn-danger" data-dismiss="modal"> delete </button></div>
                         </div>`);


                    //add file types of file category into the query editor
                    $("#button-" + counter).click(function () {
                        thisdata.inputMultiplierFiletypeFilter.deleteAllInputValues("autocompleteDeactivated");
                        let file_types = fileCategoryMap[key];
                        $("#createCategoryForm").val(key);
                        for (var file_type_index in file_types) {
                            thisdata.inputMultiplierFiletypeFilter.addInputValueOnlyOnce(file_types[file_type_index],
                                "autocompleteDeactivated");
                        }
                    })

                    $("#delete" + counter).click(function () {
                        thisdata.fileTypeCategoriesService.deleteCategory(key, function (success) {
                            console.log(success);
                        });
                    });
                });

            });
        });

        //Create a new File Category
        $("#create-category-button").click(function () {
            let category = $("#createCategoryForm").val();
            let fileTypes = [];

            thisdata.inputMultiplierFiletypeFilter.each(function (fileTypeField) {
                console.log($(fileTypeField).val())
                fileTypes.push($(fileTypeField).val());
            });

            //send ajax call
            thisdata.fileTypeCategoriesService.createCategory(category, fileTypes, function (success) {
                console.log(success);
            });

            thisdata.modal.openModalWithText("The category was created successfully", true);
        });

        //Update a File Category
        $("#update-category-button").click(function () {
            let category = $("#createCategoryForm").val();
            let fileTypes = [];

            thisdata.inputMultiplierFiletypeFilter.each(function (fileTypeField) {
                console.log($(fileTypeField).val())
                fileTypes.push($(fileTypeField).val());
            });

            //send ajax call
            thisdata.fileTypeCategoriesService.updateCategory(category, fileTypes, function (success) {
                console.log(success);
            });
            thisdata.modal.openModalWithText("The category was updated successfully", true);
        });

        //Delete File Category in Form
        $("#delete-category-button").click(function () {
            let category = $("#createCategoryForm").val();
            //send ajax call
            thisdata.fileTypeCategoriesService.deleteCategory(category, function (success) {
                console.log(success);
            });
            thisdata.modal.openModalWithText("The category was deleted successfully", true);

        });

        //Delete all file types
        $("#delete-types-button2").click(function () {
            thisdata.inputMultiplierFiletypeFilter.deleteAllInputValues("autocompleteDeactivated");
        })
    }


    onLoad() {
        //this method is called on each load of the page-section here
    }


    inputMultiplierFiletypeFilterBuilder() {


        let thisdata = this;
        let emptyFunction = function () {};

        let appendingHtmlCode = `<div class="form-group col-md-4 fg-filetype-element2"><input type="text" class="form-control filetype-element-input2"></div>`;

        let focusOutFunction = function () {
            // thisdata.fileTypeCategoriesService.updateLists();
            thisdata.metadatAutocompletion.updateLists();
        }

        let focusInIfEmptyFieldFunction = function () {
            //thisdata.fileTypeCategoriesService.reAddListener();
            thisdata.metadatAutocompletion.reAddListener();
        };


        return new InputFieldMultiplier(".fg-filetype-container2", ".filetype-element-input2", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, emptyFunction);

    }

}
