import {Page} from "../Page";
// // import {datenrangepicker} from "daterangepicker";
// import moment from 'moment';
//
// import {datetimepicker} from 'bootstrap-datetimepicker-npm';
// //import 'style!css!eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.css';
//
//


export class FormQueryEditor extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "Form Query Editor";
    }

    content() {
        return `
<form>
  <div class="form-row">

    <div class="form-group col-md-6">
      <label for="fq-query-Name">Query-Name</label>
      <input type="text" class="form-control" id="fq-query-Name">
    </div>
    <div class="form-group col-md-6">
      <label for="fq-owner">Owner</label>
      <input type="text" class="form-control" id="fq-owner">
    </div>
  </div>


  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="fq-filePattern">Query-Name</label>
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

    <div class="form-group col-md-6">
      <label for="fq-createFileTimeRangeStart">Start-DateTime</label>
      <input type="text" class="form-control" id="fq-createFileTimeRangeStart">
    </div>
     <div class="form-group col-md-6">
      <label for="fq-createFileTimeRangeEnd">Start-DateTime</label>
      <input type="text" class="form-control" id="fq-createFileTimeRangeEnd">
    </div>

   <div class="form-group col-md-12">
      <label for="fq-limit">Limit</label>
      <input type="text" class="form-control" id="fq-limit">
    </div>

<div class="col-md-12"><hr></div>

<div class="col-md-12">Which Attributes:</div>
<div class="fg-attribut-container" style="width: 100%">

     <div class="form-group col-md-4 fg-attribut-element">
          <input type="text" class="form-control attribut-element-input">
     </div>


</div>
  </div>

<button type="submit" class="btn btn-primary">Send</button>
<button type="button" class="btn btn-primary open-query">Open Query</button>
<button type="button" class="btn btn-primary send-to-graphiql">Send through GraphiQL</button>
</form>
<br>
<h4>Result:</h4>
<div>
<pre id="json" class="q_result"></pre>
</div>

        `;
    }

    onMount() {

        this.helperMethod();




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


    onUnMount() {

    }

    onRegister() {

    }

}
