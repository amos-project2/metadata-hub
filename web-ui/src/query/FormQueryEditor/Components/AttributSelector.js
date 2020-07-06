import {InputFieldMultiplier} from "../../../buisnesslogic/InputFieldMultiplier";

export class AttributSelector {


    constructor(metadatAutocompletion) {
        this.metadatAutocompletion = metadatAutocompletion;
        this.inputMultiplierAttributSelector = this.inputMultiplierAttributSelectorBuilder();
    }

    getMainHtmlCode() {

        return `
                <div class="form-row">
                    <div class="col-md-12">Which Attributes: <a class="pover" title="Which Attributes" data-content="Here you can limit the result to the specific metadata attributes.<br>If you dont add least one, then you get a result of all">[?]</a></div>
                </div>

                <div class="fg-attribut-container form-row">
                    ${this.inputMultiplierAttributSelector.getFirstElement()}
                </div>
         `;
    }


    onMount() {
        let thisdata = this;
        this.inputMultiplierAttributSelector.listenerAdd();
    }

    generateGraphQlCodeAndSetTo(formGraphQL) {
        let attributes = "";

        this.inputMultiplierAttributSelector.each(function (elem) {
            attributes += `"${$(elem).val()}", `;
        });


        if (attributes !== "") {
            attributes = `selected_attributes:[${attributes}],\n  `;
        }

        formGraphQL.attributes = attributes;

    }

    inputMultiplierAttributSelectorBuilder() {

        let thisdata = this;
        let emptyFunction = function () {};
        let appendingHtmlCode = `<div class="form-group col-md-4 fg-attribut-element"><input type="text" class="form-control attribut-element-input"></div>`;

        let focusOutFunction = function () {
            thisdata.metadatAutocompletion.updateLists();
        }


        let focusInIfEmptyFieldFunction = function () {
            thisdata.metadatAutocompletion.reAddListener();
        };


        return new InputFieldMultiplier(".fg-attribut-container", ".attribut-element-input", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, emptyFunction);

    }


}

