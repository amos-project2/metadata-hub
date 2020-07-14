/**
 *
 * Template-class
 */
export class InputFieldMultiplier {

    constructor(container, fieldSelector, appendingHtmlCode, focusInHook, focusOutHook,
                focusInIfEmptyFieldHook, additionalListenerHook) {

        this.container = container;
        this.fieldSelector = fieldSelector;
        this.appendingHtmlCode = appendingHtmlCode;
        this.focusInHook = focusInHook;
        this.focusOutHook = focusOutHook;
        this.focusInIfEmptyFieldHook = focusInIfEmptyFieldHook;
        this.additionalListenerHook = additionalListenerHook;
    }

    addFirstElementToContainer() {
        $(this.containerain).append(this.appendingHtmlCode);
    }

    getFirstElement() {
        return this.appendingHtmlCode;
    }


    listenerAdd() {
        let thisdata = this;
        $(this.fieldSelector).not(".listenerAdded").focusout(function () {
            if ($(thisdata.fieldSelector).length < 2) {return;}



            if ($(this).val() === "") {
                $(this).parent().remove();
            }

            thisdata.focusOutHook(this);

        });

        $(this.fieldSelector).not(".listenerAdded").focusin(function () {
            let dhis = this;
            let emptyTextField = false;
            $(thisdata.fieldSelector).each(function () {
                if (dhis !== this) {
                    if ($(this).val() == "") { emptyTextField = true; }
                }
            });

            if (!emptyTextField) {
                $(thisdata.container).append(thisdata.appendingHtmlCode);
                thisdata.focusInIfEmptyFieldHook(this);

                thisdata.listenerAdd(); //IMPORTANT: re-add the listener to the new created element(s)
            }

            thisdata.focusInHook(this);

        });

        //must be the last method
        $(this.fieldSelector).not(".listenerAdded").addClass("listenerAdded");

        this.additionalListenerHook();

    }

    each(func) {
        $(this.fieldSelector).each(function () {
            if ($(this).val().trim() !== "") {
                func(this);
            }

        });

    }


    addInputValue(strValue, addHtmlClassWhileAdding) {
        let lastField = $(this.fieldSelector).last();

        lastField.addClass(addHtmlClassWhileAdding);
        lastField.val(strValue);
        lastField.trigger("focusin");
        lastField.trigger("focusout");
        lastField.removeClass(addHtmlClassWhileAdding);

        return lastField;
    }

    addInputValueOnlyOnce(strValue, addHtmlClassWhileAdding) {

        let found = false;
        $(this.fieldSelector).each(function () {
            if($(this).val()===strValue) found = true;
        });
        if(found) return;

        let lastField = $(this.fieldSelector).last();

        lastField.addClass(addHtmlClassWhileAdding);
        lastField.val(strValue);
        lastField.trigger("focusin");
        lastField.trigger("focusout");
        lastField.removeClass(addHtmlClassWhileAdding);

        return lastField;
    }

    deleteInputValue(strValue, addHtmlClassWhileDeleting) {

        $(this.fieldSelector).each(function () {
            if ($(this).val() === strValue) {

                let lastField = $(this);

                lastField.addClass(addHtmlClassWhileDeleting);
                lastField.val("");
                lastField.trigger("focusin");
                lastField.trigger("focusout");
                lastField.removeClass(addHtmlClassWhileDeleting);
            }
        });

    }

    deleteAllInputValues(addHtmlClassWhileDeleting){
        $(this.fieldSelector).each(function () {
            let lastField = $(this);

            lastField.addClass(addHtmlClassWhileDeleting);
            lastField.val("");
            lastField.trigger("focusin");
            lastField.trigger("focusout");
            lastField.removeClass(addHtmlClassWhileDeleting);
        });
    }



}
