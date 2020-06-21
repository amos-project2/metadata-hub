import {Page} from "../Page";
import {ResultPresenter} from "../buisnesslogic/ResultPresenter";
// // import {datenrangepicker} from "daterangepicker";
// import moment from 'moment';
//
// import {datetimepicker} from 'bootstrap-datetimepicker-npm';
// //import 'style!css!eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.css';
//
//


export class FormQueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Form Query Editor";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
        this.filterFirstElement = this.getFilterElement();
    }

    content() {

        // language=HTML
        return `
            <form class="q-send-query-form-editor">
                <div class="form-row">

                    <div class="form-group col-md-6">
                        <label for="fq-query-Name">Query-Name <a class="pover" title="Query-Name" data-content="The Name, which is saved with the query here into the database to find it later again.">[?]</a></label>
                        <input type="text" class="form-control" id="fq-query-Name">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-owner">Owner <a class="pover" title="Owner" data-content="The Owner, which is saved with the query here into the database.">[?]</a></label>
                        <input type="text" class="form-control" id="fq-owner">
                    </div>
                </div>


                <!--  <div class="form-row">-->
                <!--    <div class="form-group col-md-6">-->
                <!--      <label for="fq-filePattern">Pattern*</label>-->
                <!--      <input type="text" class="form-control" id="fq-filePattern">-->
                <!--    </div>-->
                <!--<div class="form-group col-md-6">-->
                <!--    <div class="custom-control custom-switch">-->
                <!--&lt;!&ndash;        <label for="fq-includeVsExclude">Include/Exclude</label><br>&ndash;&gt;-->
                <!--<br>-->
                <!--        <input type="checkbox" class="custom-control-input" id="fq-includeVsExclude">-->
                <!--        <label class="custom-control-label" for="fq-includeVsExclude">Include VS Exclude</label>-->
                <!--    </div>-->
                <!--</div>-->
                <!--</div>-->


                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStart">Start-DateTime (File created)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (created-time) than Start-DateTime">[?]</a></label>
                        <input type="text" class="form-control" id="fq-createFileTimeRangeStart" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEnd">End-DateTime (File created)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (created-time) than End-DateTime">[?]</a></label>
                        <input type="text" class="form-control" id="fq-createFileTimeRangeEnd" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>


                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStartUpdated">Start-DateTime (File modified)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (modified-time) than Start-DateTime">[?]</a></label>
                        <input type="text" class="form-control" id="fq-createFileTimeRangeStartUpdated" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEndUpdated">End-DateTime (File modified)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (modified-time) than End-DateTime">[?]</a></label>
                        <input type="text" class="form-control" id="fq-createFileTimeRangeEndUpdated" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>


                <div class="form-row">
                    <div class="form-group col-md-12">
                        <label for="fq-limit">Limit <a class="pover" title="Limit" data-content="The max output limit.<br>Empty means no limit.">[?]</a></label>
                        <input type="text" class="form-control" id="fq-limit">
                    </div>
                </div>

                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="fq-showDeleted">
                    <label class="form-check-label" for="fq-showDeleted">
                        Show deleted files
                        <a class="pover" title="Show deleted files" data-content="If checked deleted files that are still in the database are also shown.">[?]</a>
                    </label>
                </div>

                <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>


                <div class="form-row">
                    <div class="col-md-12">Filter: <a class="pover" title="Filter" data-content="Select a filter option.<br>Specify on which metadataattribut you want to use the filter. In the last Input must insert the value<br>For example: Pattern include FileName dog">[?]</a></div>
                </div>

                <div class="fg-filter-container">
                    ${this.filterFirstElement}
                </div>
                <div>
                <div class="form-row justify-content-md-center">
                    <div class="form-group col-md-2">
                    <label for="fg-filter-connector-options">Filter Connector<a class="pover" title="Filter Connector" data-content="TODO">[?]</a></label>
                        <select class="custom-select fg-filter-connector-options" id="fg-filter-connector-options">
                                <option value="all-and" selected>ALL-AND</option>
                                <option value="all-or">ALL-OR</option>
                                <option value="custom">Custom</option>
                            </select>
                    </div>
                </div>

                 <div class="form-row fq-custom-filter-connector-row" style="display:none">
                    <div class="form-group col-md-12">
                        <label for="fq-custom-filter-connector">Custom Filter<a class="pover" title="Custom Filter" data-content="TODO">[?]</a></label>
                        <input type="text" class="form-control" id="fq-custom-filter-connector" value="testa">
                    </div>
                </div>

                </div>



                <div class="form-row">
                    <div class="col-md-12">
                        <hr>
                    </div>
                </div>

                <div class="form-row">
                    <div class="col-md-12">Which Attributes: <a class="pover" title="Which Attributes" data-content="Here you can limit the result to the specific metadata attributes.<br>If you dont add least one, then you get a result of all">[?]</a></div>
                </div>


                <div class="fg-attribut-container form-row">

                    <div class="form-group col-md-4 fg-attribut-element">
                        <input type="text" class="form-control attribut-element-input">
                    </div>
                </div>


                <button type="submit" class="btn btn-primary">Send</button>
                <button type="button" class="btn btn-primary open-query">Open Query</button>
                <button type="button" class="btn btn-primary send-to-graphiql">Send to GraphiQL</button>
                <button type="button" class="btn btn-primary clear-all">Clear All</button>
            </form>
            <br>
            <div class="resultView1"></div>


            ${this.getModalCode()}

            `;


    }

    getModalCode() {

        // language=HTML
        return `
            <div class="modal fade" id="graphql-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">GraphQl Code Inspection</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <pre id="graphql-code-content"></pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary send-to-graphiql" data-dismiss="modal">Send to GraphiQL</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;

    }

    onMount() {

        $(".resultView1").html(this.resultPresenter.getHtml());

        this.helperMethod();
        this.helperMethod2();
        this.inputValidation();
        this.inputSuggestion();
        let thisdata = this;

        $(".q-send-query-form-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.buildAndGetGraphQlQuery());

            // thisdata.graphQlFetcher.fetchAdvanced(thisdata.buildAndGetGraphQlQuery(), function (sucess, json, jsonString) {
            //     $(".q_result").text(jsonString);
            //     thisdata.resultPresenter.addDataToResult(jsonString);
            // });
        });

        $(".open-query").click(function () {

            $("#graphql-code-content").text(thisdata.buildAndGetGraphQlQuery());
            $('#graphql-modal').modal()

        });

        $(".send-to-graphiql").click(function () {

            thisdata.parent.storage.query_inject = thisdata.buildAndGetGraphQlQuery();
            thisdata.parent.storage.openedFromEditor = true;
            $("#nav-element-graphiql-console").trigger("click");

        });


        $(".clear-all").click(function () {
            thisdata.clearCache();
            thisdata.reload();
        });


        $(".fg-filter-connector-options").change(function () {
            if ($(this).val() === "custom") {
                $(".fq-custom-filter-connector-row").stop(true).show(1000);
            } else {
                $(".fq-custom-filter-connector-row").stop(true).hide(1000);
            }
        });


        //alert(datetimepicker());
        //  datetimepicker(jQuery);
        // alert($('#fq-createFileTimeRange').datetimepicker);
        // $('#fq-createFileTimeRange').datetimepicker();
        // $('#fq-createFileTimeRange').daterangepicker({
        //     timePicker: true,
        //     startDate: moment().startOf('hour'),
        //     endDate: moment().startOf('hour').add(32, 'hour'),
        //     locale: {
        //         format: 'M/DD hh:mm A'
        //     }
        // });
    }

    helperMethod() {

        let dhis_state = this;

        $(".attribut-element-input").focusout(function () {
            if ($(".attribut-element-input").length < 2) {return;}

            if ($(this).val() === "") {
                $(this).parent().remove();
            }
        });

        $(".attribut-element-input").focusin(function () {
            let dhis = this;
            let emptyTextField = false;
            $(".attribut-element-input").each(function () {
                if (dhis !== this) {
                    // alert($(this).val());
                    if ($(this).val() == "") { emptyTextField = true; }
                }
            });

            if (!emptyTextField) {
                $(".fg-attribut-container").append(`
    <div class="form-group col-md-4 fg-attribut-element">
          <input type="text" class="form-control attribut-element-input">
    </div>`);


                dhis_state.helperMethod();//IMPORTANT: re-add the listener to the new created element(s)
            }

        });
    }


    helperMethod2() {

        let dhis_state = this;

        $(".fg-metadata-attribute").focusout(function () {
            if ($(".fg-metadata-attribute").length < 2) {return;}

            if ($(this).val() === "") {
                $(this).parent().remove();
            }
        });

        $(".fg-metadata-attribute").focusin(function () {
            let dhis = this;
            let emptyTextField = false;
            $(".fg-metadata-attribute").each(function () {
                if (dhis !== this) {
                    // alert($(this).val());
                    if ($(this).val() == "") { emptyTextField = true; }
                }
            });

            if (!emptyTextField) {
                $(".fg-filter-container").append(dhis_state.getFilterElement());

                dhis_state.helperMethod2();//IMPORTANT: re-add the listener to the new created element(s)
            }

        });
    }

    inputValidation() {

    }

    inputSuggestion() {
        // $( function() {
        //     var availableTags = [
        //         "searchForFileMetadata"
        //     ];
        //     $( "#fq-query-Name" ).autocomplete({
        //         source: availableTags
        //     });
        // } );
    }


    buildAndGetGraphQlQuery() {

        // let filepattern = $("#fq-filePattern").val();
        //  let checkbox = $("#fq-includeVsExclude").prop('checked');
        let limit = $("#fq-limit").val();
        let showDeleted = $("#fq-showDeleted").prop('checked');
        let deleted = "";
        let startDate = $("#fq-createFileTimeRangeStart").val();
        let endDate = $("#fq-createFileTimeRangeEnd").val();

        let startDateUpdated = $("#fq-createFileTimeRangeStartUpdated").val();
        let endDateUpdated = $("#fq-createFileTimeRangeEndUpdated").val();

        // if (filepattern !== "") {filepattern = `pattern: "${filepattern}",`;} else {filepattern = "";}
        // if (!checkbox) {checkbox = "option: included,";} else {checkbox = "option: excluded,";}
        if (limit !== "") {limit = `limitFetchingSize: ${limit},\n  `;} else {limit = "";}
        if (showDeleted) {deleted = `showDeleted: true`;}
        ;
        if (startDate !== "") {startDate = `start_creation_time: "${startDate}",\n  `;} else {startDate = "";}
        if (endDate !== "") {endDate = `end_creation_time: "${endDate}",\n  `;} else {endDate = "";}
        if (startDateUpdated !== "") {startDateUpdated = `start_modification_time: "${startDateUpdated}",\n  `;} else {startDateUpdated = "";}
        if (endDateUpdated !== "") {endDateUpdated = `end_modification_time: "${endDateUpdated}",\n  `;} else {endDateUpdated = "";}


        let attributes = "";
        {
            $(".attribut-element-input").each(function () {
                if ($(this).val() !== "") {
                    attributes += `"${$(this).val()}", `;
                }

            });

            if (attributes !== "") {
                attributes = `selected_attributes:[${attributes}],\n  `;
            }
        }

        let options_options = "";
        let options_attributes = "";
        let options_values = "";
        {
            $(".fg-metadata-attribute").each(function () {
                if ($(this).val() !== "") {
                    options_attributes += `"${$(this).val()}", `;
                    options_options += `${$(this).parent().find(".fg-filter-function").val()}, `;
                    options_values += `"${$(this).parent().find(".fg-metadata-value").val()}", `;
                }

            });

            //cause all lists have to have the same size, its ok doing this so
            if (options_attributes !== "") {
                options_options = `metadata_options:[${options_options}],\n  `;
                options_attributes = `metadata_attributes:[${options_attributes}],\n  `;
                options_values = `metadata_values:[${options_values}],\n  `;
            }
        }

//dont change the formatting here, cause this has a direct change to the formatting in the graphql-inspection-window
        let query_header = `
   ${limit}
   ${deleted}
   ${startDate} ${endDate} ${startDateUpdated} ${endDateUpdated}
   ${options_options} ${options_attributes} ${options_values}
   ${attributes}
        `;

        if (query_header.trim() === "") {
            query_header = "";
        } else {
            query_header = `(
            ${query_header}
  )`
        }

        let query = `
query
{
  searchForFileMetadata
  ${query_header}
  {
    id,
    crawl_id,
    dir_path,
    name,
    type,
    creation_time,
    access_time,
    modification_time,
    file_hash,
    deleted,
    metadata
    {
      name,
      value,
    }
  }
}`;
//END dont do a change

        return query;


// searchForFileMetadata(file_ids: [Int!], crawl_ids: [Int!], dir_path: String, dir_path_option: MetadataOption,
//     file_name: String, file_name_option: MetadataOption, file_type: String, size: Int, size_option: IntOption,
//     start_creation_time: String, end_creation_time: String, start_access_time: String, end_access_time: String,
//     start_modification_time: String, end_modification_time: String, file_hashes: [String!],
//     metadata_attributes: [String!], metadata_values:[String!], metadata_options: [MetadataOption!],
//     selected_attributes: [String!], limitFetchingSize: Int) : [File]

    }


    getFilterElement() {

        //included, excluded, equal, bigger smaller, exists

        // language=HTML
        return `
            <div class="form-row">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <select class="custom-select fg-filter-function">
                            <option selected value="included">Pattern included</option>
                            <option value="excluded">Pattern excluded</option>
                            <option value="equal">Equal</option>
                            <option value="exists">Exists (Attribute)</option>
                            <option value="bigger">Greather Than</option>
                            <option value="smaller">Lower Than</option>
                        </select>
                        <div class="input-group-text" style="display:none;">
                            <input type="checkbox" checked class="fg-include-exclude">
                        </div>
                    </div>
                    <input type="text" class="form-control fg-metadata-attribute" placeholder="Metadata-Attribute">
                    <input type="text" class="form-control fg-metadata-value" placeholder="Value">
                </div>
            </div>`;
    }


    onUnMount() {

    }

    onRegister() {

    }

    onUnLoad() {

    }

}
