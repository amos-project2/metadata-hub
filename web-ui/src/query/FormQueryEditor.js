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
        this.graphQlFetcher=this.parent.dependencies.graphQlFetcher;
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
    }

    content() {
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


  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="fq-filePattern">Pattern*</label>
      <input type="text" class="form-control" id="fq-filePattern">
    </div>
<div class="form-group col-md-6">
    <div class="custom-control custom-switch">
<!--        <label for="fq-includeVsExclude">Include/Exclude</label><br>-->
<br>
        <input type="checkbox" class="custom-control-input" id="fq-includeVsExclude">
        <label class="custom-control-label" for="fq-includeVsExclude">Include VS Exclude</label>
    </div>
</div>
</div>

  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="fq-createFileTimeRangeStart">Start-DateTime <a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (created-time) than Start-DateTime">[?]</a></label>
      <input type="text" class="form-control" id="fq-createFileTimeRangeStart" placeholder="2020-05-22 07:19:29">
    </div>
     <div class="form-group col-md-6">
      <label for="fq-createFileTimeRangeEnd">End-DateTime <a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (created-time) than End-DateTime">[?]</a></label>
      <input type="text" class="form-control" id="fq-createFileTimeRangeEnd" placeholder="2020-07-28 20:35:22">
    </div>
    </div>

  <div class="form-row">
   <div class="form-group col-md-12">
      <label for="fq-limit">Limit <a class="pover" title="Limit" data-content="The max output limit.<br>Empty means no limit.">[?]</a></label>
      <input type="text" class="form-control" id="fq-limit">
    </div>
    </div>

  <div class="form-row">
     <div class="col-md-12"><hr></div>
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
      <div class="modal-body" >
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


    buildAndGetGraphQlQuery() {

        let filepattern = $("#fq-filePattern").val();
        let checkbox = $("#fq-includeVsExclude").prop('checked');
        let limit = $("#fq-limit").val();
        let startDate = $("#fq-createFileTimeRangeStart").val();
        let endDate = $("#fq-createFileTimeRangeEnd").val();

        if (filepattern !== "") {filepattern = `pattern: "${filepattern}",`;} else {filepattern = "";}
        if (!checkbox) {checkbox = "option: included,";} else {checkbox = "option: excluded,";}
        if (limit !== "") {limit = `limitFetchingSize: ${limit},`;} else {limit = "";}
        if (startDate !== "") {startDate = `startTime: "${startDate}",`;} else {startDate = "";}
        if (endDate !== "") {endDate = `endTime: "${endDate}",`;} else {endDate = "";}

        let attributes = "";
        $(".attribut-element-input").each(function () {
            if ($(this).val() !== "") {
                attributes += `"${$(this).val()}", `;
            }

        });

        if (attributes !== "") {
            attributes = `sel_attributes:[${attributes}],`;
        }


        let query = `
query
{
  search(${filepattern} ${checkbox} ${limit} ${startDate} ${endDate} ${attributes})
  {
    sub_path,
    name,
    metadata
    {
      name,
      value,
    }
  }
}`;

        return query

    }

    onUnMount() {

    }

    onRegister() {

    }

    onUnLoad() {

    }

}
