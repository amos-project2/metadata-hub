import {Page} from "../../../Page";
import {FileTypeCategoriesService} from "./FileTypeCategoriesService";
import {MetadataAutocompletion} from "../autocompletion/MetadataAutocompletion";
import {FiletypeFilter} from "../Components/FiletypeFilter";
import {InputFieldMultiplier} from "../../../Utilities/InputFieldMultiplier";


export class FileTypeCategories extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "File Type Categories";
        this.cacheLevel = 3;
        //use 0 for no caching (the dom for this page will be deleted and onMound/onUnMount is called each enter and leaving the page here)
        //use 3 for complete caching(the dome for this page stay after leaving
        //     (its only hidden, be careful, of using html-classes/ids in more areas of the whole webpage, that they dont overlap))
        //     onMount is only called at the first time, unOnLoad-never (except if you use the delete-cache-method)
        //     i think using 3 here is a good idea, so the user can work on a formular go to other page and go back to work on
        //     the dynamic stuff in the page is handled by javascript, timers who reload parts for page in a specific way for specific page-components


        //here you set the title-attribut
        //you can here also set the caching_behavour and much more
        //take a look in class Page

        this.fileTypeCategoriesService = new FileTypeCategoriesService();
        this.inputMultiplierFiletypeFilter = this.inputMultiplierFiletypeFilterBuilder();
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;

        this.metadatAutocompletion = new MetadataAutocompletion(
            this.parent.dependencies.restApiFetcherServer,
            this.graphQlFetcher,
            ".filetype-element-input",
            ".fg-metadata-attribute",
            ".attribut-element-input",
            ".modalOpenerSelector",
        );

        this.filetypeFilter = new FiletypeFilter(this.metadatAutocompletion);
    }

    content() {
        return `
                <!--     file-category-selector       -->
                <div class="form-group col-md-6">
                    <button type="button" id="file-category-button" class="btn btn-primary btn-lg btn-block" data-toggle="modal" data-target="#file-categories-modal">
                        Select File Category
                    </button>
                    <button type="button" id="delete-types-button" class="btn btn-danger" ">
                        Delete all File Types
                    </button>
                </div>

                <!-- file-categories-modal -->
                <div class="modal fade" id="file-categories-modal" tabindex="-1" role="dialog" aria-labelledby="file-categories-label" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="file-categories-label">
                                    File Categories
                                </h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body" id="file-categories-modal-body">
                            No Categories available :(
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

        <!--     filetypes            -->
        ${this.filetypeFilter.getFileTypesHtmlCode()}

        <div class="form-row">
            <div class="col-md-12">
                <hr>
            </div>
        </div>
        `;
    }

    onMount() {
        let thisdata = this;

        this.filetypeFilter.onMount();
        this.metadatAutocompletion.addListener();

        //Activate File Category Modal Pop-Up Window
        $("#file-category-button").click(function () {
            thisdata.metadatAutocompletion.getAllFileCategories(function (fileCategoryMap) {

                console.log(fileCategoryMap);

                if(fileCategoryMap == undefined){
                    return;
                }

                $("#file-categories-modal-body").html("Click on a file category to choose multiple file types for the query editor.<br/><br/>")

                Object.keys(fileCategoryMap).forEach( key => {
                    $("#file-categories-modal-body").append("<button type=\"button\" class=\"btn btn-primary\" id='button-"+ key + "' data-dismiss=\"modal\"> File Category: " + key + "</button> <br/>");
                    $("#file-categories-modal-body").append("File Types: " + "<br\>" + fileCategoryMap[key] + "<br/><br/>");

                    //add file types of file category into the query editor
                    $("#button-"+key).click(function () {
                        let file_types = fileCategoryMap[key];
                        for(var file_type_index in file_types){
                            thisdata.inputMultiplierFiletypeFilter.addInputValueOnlyOnce(file_types[file_type_index],
                                "autocompleteDeactivated");
                        }
                    })
                });

            });
        });

        //Delete all file types
        $("#delete-types-button").click(function () {
            thisdata.inputMultiplierFiletypeFilter.deleteAllInputValues("autocompleteDeactivated");
        })
    }

    onUnMount() {

        //its called at caching-level=3 never(except you call the clearCache-method)
        //its called at caching-level=0 each time you leave the page and after onUnLoad-method is called

        //often you dont need that method, not in both cases i mentioned here
    }

    onRegister() {
        //this method is called at the time (and only one time) the whole webapplication is started
        //often you dont need that method
    }

    onFirstLoad() {
        //this method is called on the first-load, while onLoad is called on each load

        //note:
        //this method could be interessting, if caching-level is 0 and you want to have to run any only one time
        //and not on each onMount-Time (at caching-level=0)
    }

    onLoad() {
        //this method is called on each load of the page-section here
    }

    onUnLoad() {
        //this method is called on each unload of the page-section here
    }

    inputMultiplierFiletypeFilterBuilder() {

        let thisdata = this;
        let emptyFunction = function () {};

        let appendingHtmlCode = `<div class="form-group col-md-4 fg-filetype-element"><input type="text" class="form-control filetype-element-input save-element" data-name="t1" data-multiplier="true"></div>`;

        let focusOutFunction = function () {
            thisdata.metadatAutocompletion.updateLists();
        }

        let focusInIfEmptyFieldFunction = function () {
            thisdata.metadatAutocompletion.reAddListener();
        };


        return new InputFieldMultiplier(".fg-filetype-container", ".filetype-element-input", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, emptyFunction);

    }

}
