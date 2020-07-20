import {InputFieldMultiplier} from "../../../Utilities/InputFieldMultiplier";

export class FiletypeFilter {


    constructor(metadatAutocompletion) {
        this.metadatAutocompletion = metadatAutocompletion;
        this.inputMultiplierFiletypeFilter = this.inputMultiplierFiletypeFilterBuilder();
    }

    getMainHtmlCode() {

        return `
                <!--     file-category-selector       -->

                 <div class="form-row justify-content-md-center">
                  <button type="button" id="file-category-button" class="btn btn-primary mr-3" data-toggle="modal" data-target="#file-categories-modal">
                        Select File Category
                  </button>
                   <button type="button" id="delete-types-button" class="btn btn-danger" ">
                        Clear selected File Types
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

                <!--     file-types                  -->
                <div class="form-row">
                    <div class="col-md-12">Filetype Filters: <a class="pover" title="Filetype Filters" data-content="If unused all file types get returned!</br> If this filter is used, only files which are of one of the specified file types get returned.</br>
                        The file type filter is used aswell for giving better Metadata-Attribute recommendations.">[?]</a></div>
                </div>


                <div class="fg-filetype-container form-row">

                       ${this.inputMultiplierFiletypeFilter.getFirstElement()}

                </div>
                <div class="form-row justify-content-md-center">
                    <button type="button" class="btn btn-primary modalOpenerSelector">Open Metadata-Attribut-Selector</button>
                </div>
              `;
    }

    getFileTypesHtmlCode() {
        return `

        <!--     file-types                  -->
        <div class="fg-filetype-container form-row">

            ${this.inputMultiplierFiletypeFilter.getFirstElement()}

        </div>

            `;
    }


    onMount() {
        let thisdata = this;

        this.inputMultiplierFiletypeFilter.listenerAdd();

        //Activate File Category Modal Pop-Up Window
        $("#file-category-button").click(function () {
            thisdata.metadatAutocompletion.getAllFileCategories(function (fileCategoryMap) {


                if (fileCategoryMap == undefined) {
                    return;
                }

                $("#file-categories-modal-body").html("Click on a file category to choose multiple file types for the Filetype Filter. The contained File Types of a Category are enumerated below them.<br/><br/>")

                let counter = -1;
                Object.keys(fileCategoryMap).forEach(key => {
                    counter++;

                    let fileCategoryString = "";
                    fileCategoryMap[key].forEach(value => {
                        fileCategoryString += value + ", ";
                    });
                    fileCategoryString = fileCategoryString.substr(0, fileCategoryString.length - 2);
                    $("#file-categories-modal-body").append(`
                        <div class="row mb-3 detail-view-element">
                            <div class="col font-weight-bold">${key}</div>
                            <div class="col">${fileCategoryString}</div>
                            <div class="col-2"><button type="button" class="btn btn-primary btn-sm" id='fbutton-${counter}' data-dismiss="modal">Apply</button></div>

                         </div>`);


                    //add file types of file category into the query editor
                    $("#fbutton-" + counter).click(function () {
                        let file_types = fileCategoryMap[key];
                        for (var file_type_index in file_types) {
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

    generateGraphQlCodeAndSetTo(formGraphQL) {

        let filetypes = "";

        this.inputMultiplierFiletypeFilter.each(function (elem) {
            filetypes += `"${$(elem).val()}", `;
        });


        if (filetypes !== "") {
            filetypes = `file_types:[${filetypes}],\n  `;
        }

        formGraphQL.filetypes = filetypes;

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

