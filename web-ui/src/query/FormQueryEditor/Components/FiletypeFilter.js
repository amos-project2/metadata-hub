import {InputFieldMultiplier} from "../../../buisnesslogic/InputFieldMultiplier";

export class FiletypeFilter {


    constructor(metadatAutocompletion) {
        this.metadatAutocompletion = metadatAutocompletion;
        this.inputMultiplierFiletypeFilter = this.inputMultiplierFiletypeFilterBuilder();
    }

    getMainHtmlCode() {

        return `
                <div class="form-row">
                    <div class="col-md-12">Which Filetypes: <a class="pover" title="Which Filetypes" data-content="Here you can specify a prefilter of filetypes. If it is empty means, no filetype-filter here">[?]</a></div>
                </div>


                <div class="fg-filetype-container form-row">

                       ${this.inputMultiplierFiletypeFilter.getFirstElement()}

                </div>
                <div class="form-row justify-content-md-center">
                    <button type="button" class="btn btn-primary modalOpenerSelector mr-3">Open Metadata-Attribut-Selector</button>
                    <button type="button" class="btn btn-danger modalClearCache mr-3">Clear Autocompletion Cache</button>
                </div>
              `;
    }


    onMount() {
        let thisdata = this;

        this.inputMultiplierFiletypeFilter.listenerAdd();

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

        let appendingHtmlCode = `<div class="form-group col-md-4 fg-filetype-element"><input type="text" class="form-control filetype-element-input"></div>`;

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

