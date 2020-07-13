import {InputFieldMultiplier} from "../../../Utilities/InputFieldMultiplier";

export class AdvancedFilter {


    constructor(metadatAutocompletion) {
        this.metadatAutocompletion = metadatAutocompletion;
        this.inputMultiplierAdvancedFilterRows = this.inputMultiplierAdvancedFilterRowsBuilder();

    }

    getMainHtmlCode() {

        return `
                <div class="form-row">
                    <div class="col-md-12">Filter: <a class="pover" title="Filter" data-content="Select a filter option.<br>Specify on which metadataattribut you want to use the filter. In the last Input must insert the value<br>For example: Pattern include FileName dog">[?]</a></div>
                </div>

                <div class="fg-filter-container">
                    ${this.inputMultiplierAdvancedFilterRows.getFirstElement()}
                </div>
                <div>
                <div class="form-row justify-content-md-center">
                    <div class="form-group col-md-2">
                    <label for="fg-filter-connector-options">Filter Connector<a class="pover-filter-connector" style="cursor:pointer; color: #007bff;">[?]</a></label>
                        <select class="custom-select fg-filter-connector-options save-element" data-name="f1" id="fg-filter-connector-options">
                                <option value="all-and" selected>ALL AND</option>
                                <option value="all-or">ALL OR</option>
                                <option value="custom-only">Custom Only</option>
                                <option value="custom-and">Custom And</option>
                                <option value="custom-or">Custom OR</option>
                            </select>
                    </div>
                </div>

                 <div class="form-row fq-custom-filter-connector-row-description" style="display:none">
                 <p class="text-left"><b>Filter-Connector-Description:</b>
                   <br><br>You can choose here from 5 different filter-connector options. Each option connects your filter in a different way.
                   <br><b>All AND</b> connects al filter with an AND.
                   <br><b>ALL OR</b> connects all filter with an OR.
                   <br><b>Custom Only</b> connects the filter in that way, you want to connect them. So you can connect some filters with an AND some others with an OR, you can also use brackets to group it. If you want to negate a filter you can use a NOT
                   <br><b>Custom And</b> connects the filter the same way Custum Only does, but appends automatically all not in your custom-input referenced filters with an AND
                   <br><b>Custom Or</b> connects the filter the same way Custum Only does, but appends automatically all not in your custom-input referenced filters with an OR
                   <br>
                   </p>
                </div>

                 <div class="form-row fq-custom-filter-connector-row" style="display:none">
                    <div class="form-group col-md-12">
                        <label for="fq-custom-filter-connector">Custom Filter<a class="pover" title="Custom Filter" data-content="Here you can type in your own bool-expression: Example ((f1 AND f2) OR (f3 AND NOT f0)) AND f5">[?]</a></label>
                        <input type="text" class="form-control save-element" data-name="f2" id="fq-custom-filter-connector" value="">
                    </div>
                </div>

                </div>`;

    }

    getFilterElement() {

        //included, excluded, equal, bigger smaller, exists

        // language=HTML
        return `
            <div class="form-row">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <select class="custom-select fg-filter-function save-element" data-name="f3" data-multiplier="true">
                            <option selected value="included">Pattern included</option>
                            <option value="excluded">Pattern excluded</option>
                            <option value="equal">Equal</option>
                            <option value="exists">Exists (Attribute)</option>
                            <option value="bigger">Greather Than</option>
                            <option value="smaller">Lower Than</option>
                        </select>
                    </div>
                    <input type="text" class="form-control fg-metadata-attribute save-element" data-name="f4" data-multiplier="true" placeholder="Metadata-Attribute">
                    <input type="text" class="form-control fg-metadata-value save-element" data-name="f5" data-multiplier="true" placeholder="Value">
                    <div class="input-group-append function-name-appender" style="display:none;">
                        <span class="input-group-text font-weight-bold function-name-appender-value" style="color:#ff0000;">f1</span>
                    </div>
                </div>
            </div>`;
    }


    onMount() {
        let thisdata = this;

        this.inputMultiplierAdvancedFilterRows.listenerAdd();

        $(".fg-filter-connector-options").change(function () {
            if ($(this).val().includes("custom")) {
                thisdata.reorderFunctionIdsInFilter();
                $(".fq-custom-filter-connector-row").stop(true).show(1000);
                // $(".function-name-appender").stop(true).show(1000);
            } else {
                $(".fq-custom-filter-connector-row").stop(true).hide(1000);
                $(".function-name-appender").stop(true).hide(1000);
            }
        });

        $(".pover-filter-connector").click(function () {
            $(".fq-custom-filter-connector-row-description").toggle(1000);
        });

    }

    generateGraphQlCodeAndSetTo(formGraphQL) {
        let filterOption = $(".fg-filter-connector-options").val();
        let filterCustomString = $("#fq-custom-filter-connector").val();
        let options_options = "";
        let options_attributes = "";
        let options_values = "";

        if (filterCustomString !== "" && filterOption.includes("custom")) {filterCustomString = `metadata_filter_logic: "${filterCustomString}",\n  `} else {filterCustomString = "";}

        if (filterOption === "all-and" || filterOption === "custom-and") {
            filterOption = `metadata_filter_logic_options: and,\n  `;
        } else if (filterOption === "all-or" || filterOption === "custom-or") {
            filterOption = `metadata_filter_logic_options: or,\n  `;
        } else {
            filterOption = `metadata_filter_logic_options: only_logic_string,\n  `;
        }

        this.inputMultiplierAdvancedFilterRows.each(function (elem) {
            options_attributes += `"${$(elem).val()}", `;
            options_options += `${$(elem).parent().find(".fg-filter-function").val()}, `;
            options_values += `"${$(elem).parent().find(".fg-metadata-value").val()}", `;

        });

        //cause all lists have to have the same size, its ok doing this so
        if (options_attributes !== "") {
            options_options = `metadata_options:[${options_options}],\n  `;
            options_attributes = `metadata_attributes:[${options_attributes}],\n  `;
            options_values = `metadata_values:[${options_values}],\n  `;
        }

        formGraphQL.filterOption = filterOption;
        formGraphQL.filterCustomString = filterCustomString;
        formGraphQL.options_options = options_options;
        formGraphQL.options_attributes = options_attributes;
        formGraphQL.options_values = options_values;
    }


    reorderFunctionIdsInFilter() {
        let countElements = $(".fg-metadata-attribute").length;
        let counter = 0;
        let counter2 = -1;

        let customValue = "" + $("#fq-custom-filter-connector").val();

        $(".fg-metadata-attribute").each(function () {
            counter++;
            counter2++;

            if (counter == countElements) {
                $(this).parent().find(".function-name-appender-value").html("not used right now");
                $(this).parent().find(".function-name-appender").stop(true).hide(1000);
                return;
            }

            //reorder function-Ids:
            let oldValue = $(this).parent().find(".function-name-appender-value").html();
            if (oldValue !== "f" + counter2) {
                // customValue = customValue.replaceAll(oldValue, "XXXX" + counter2);
                customValue = customValue.split(oldValue).join("XXXX" + counter2);
                customValue = customValue.split("f" + counter2).join("MISSING" + counter2);
            }


            $(this).parent().find(".function-name-appender-value").html("f" + counter2);
            if ($(".fg-filter-connector-options").val().includes("custom")) {
                $(this).parent().find(".function-name-appender").stop(true).show(1000);
            }

        });

        counter2 = -1;
        $(".fg-metadata-attribute").each(function () {
            counter2++;
            // customValue = customValue.replaceAll("XXXX" + counter2, "f"+counter2);
            customValue = customValue.split("XXXX" + counter2).join("f" + counter2);
        });
        $("#fq-custom-filter-connector").val(customValue);

    }


    inputMultiplierAdvancedFilterRowsBuilder() {

        let thisdata = this;
        let emptyFunction = function () {};
        let appendingHtmlCode = this.getFilterElement();

        let focusOutFunction = function (elem) {



            thisdata.reorderFunctionIdsInFilter();
            thisdata.metadatAutocompletion.updateLists();

            //Validate Metadata Datatype:
            // Queries the server to know which kind of datatype the metadatavalue of a given metadata tag has
            if ($(elem).val().length > 1) {

                thisdata.metadatAutocompletion.getDataType($(elem).val(), function (datatype) {

                    console.log("datatype is " + datatype)

                    if (datatype == "str") {
                        $(elem).parent().find(".fg-metadata-value").prop('placeholder', "Value [Text]");
                        $(elem).parent().find(".fg-metadata-value").prop('type', 'text');
                    } else if (datatype == "dig") {
                        $(elem).parent().find(".fg-metadata-value").prop('placeholder', "Value [Number]");
                        $(elem).parent().find(".fg-metadata-value").prop('type', 'number');
                    } else {
                        $(elem).parent().find(".fg-metadata-value").prop('placeholder', "Value");
                        $(elem).parent().find(".fg-metadata-value").prop('type', 'number');
                    }
                });
            }
        }

        let focusInIfEmptyFieldFunction = function () {
            thisdata.reorderFunctionIdsInFilter();
            thisdata.metadatAutocompletion.reAddListener();
        };

        let additionalListenerFunction = function () {
            $(".fg-filter-function").not(".listenerAdded").change(function () {
                if ($(this).val() === "exists") {
                    $(this).parent().parent().find(".fg-metadata-value").hide();
                } else {
                    $(this).parent().parent().find(".fg-metadata-value").show();
                }

            });

            $(".fg-filter-function").not(".listenerAdded").addClass("listenerAdded");
        }


        return new InputFieldMultiplier(".fg-filter-container", ".fg-metadata-attribute", appendingHtmlCode, emptyFunction,
            focusOutFunction, focusInIfEmptyFieldFunction, additionalListenerFunction);

    }


}

