export class DateRangeFilter {


    constructor() {

    }

    getMainHtmlCode() {

        return `
         <button type="button" class="btn btn-primary" id="apply-time-filter-button">Apply Time Filters</button>

         <div class="form-row data-range-filters">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStart">Start Creation Time<a class="pover" title="Start Creation Time" data-content="Filters out all Files with a creation time before Start Creation Time.">[?]</a></label>
                        <input type="datetime-local" class="form-control save-element" data-name="d1" id="fq-createFileTimeRangeStart" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEnd">End Creation Time<a class="pover" title="End Creation Time" data-content="Filters out all Files with a creation time older than End Creation Time.">[?]</a></label>
                        <input type="datetime-local" class="form-control save-element" data-name="d2" id="fq-createFileTimeRangeEnd" placeholder="2020-07-28 20:35:22">
                    </div>
         </div>

         <div class="form-row data-range-filters">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStartUpdated">Start Modification Time<a class="pover" title="Start-DateTime" data-content="Filters out all Files with a modification time before Start Modification Time.">[?]</a></label>
                        <input type="datetime-local" class="form-control save-element" data-name="d3" id="fq-createFileTimeRangeStartUpdated" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEndUpdated">End Modification Time<a class="pover" title="End-DateTime" data-content="Filters out all Files with a modification time older than End Modification Time.">[?]</a></label>
                        <input type="datetime-local" class="form-control save-element" data-name="d4" id="fq-createFileTimeRangeEndUpdated" placeholder="2020-07-28 20:35:22">
                    </div>
         </div>
         <br>
                `;
    }


    onMount() {
        $(".data-range-filters").toggle();
        $("#apply-time-filter-button").click(function() {
            $(".data-range-filters").toggle("slow");
        });

    }

    generateGraphQlCodeAndSetTo(formGraphQL) {

        let startDate = $("#fq-createFileTimeRangeStart").val();
        let endDate = $("#fq-createFileTimeRangeEnd").val();
        let startDateUpdated = $("#fq-createFileTimeRangeStartUpdated").val();
        let endDateUpdated = $("#fq-createFileTimeRangeEndUpdated").val();

        if (startDate !== "") {startDate = `start_creation_time: "${startDate}",\n  `;} else {startDate = "";}
        if (endDate !== "") {endDate = `end_creation_time: "${endDate}",\n  `;} else {endDate = "";}
        if (startDateUpdated !== "") {startDateUpdated = `start_modification_time: "${startDateUpdated}",\n  `;} else {startDateUpdated = "";}
        if (endDateUpdated !== "") {endDateUpdated = `end_modification_time: "${endDateUpdated}",\n  `;} else {endDateUpdated = "";}

        formGraphQL.startDate = startDate;
        formGraphQL.endDate = endDate;
        formGraphQL.startDateUpdated = startDateUpdated;
        formGraphQL.endDateUpdated = endDateUpdated;

    }


    inputValidation() {

        //Validate Date
        $("#fq-createFileTimeRangeStart").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeStart");

            let startDate = $("#fq-createFileTimeRangeStart").val();
            let endDate = $("#fq-createFileTimeRangeEnd").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('Start Time must be before End Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeEnd").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeEnd");

            let startDate = $("#fq-createFileTimeRangeStart").val();
            let endDate = $("#fq-createFileTimeRangeEnd").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('End Time must be after Start Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeStartUpdated").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeStartUpdated");

            let startDate = $("#fq-createFileTimeRangeStartUpdated").val();
            let endDate = $("#fq-createFileTimeRangeEndUpdated").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('Start Time must be before End Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })

        $("#fq-createFileTimeRangeEndUpdated").focusout(function () {

            let startDateElement = document.getElementById("fq-createFileTimeRangeEndUpdated");

            let startDate = $("#fq-createFileTimeRangeStartUpdated").val();
            let endDate = $("#fq-createFileTimeRangeEndUpdated").val();

            if (startDate != "" && endDate != "" && startDate > endDate) {
                startDateElement.setCustomValidity('End Time must be after Start Time');
                startDateElement.reportValidity();
            } else {
                startDateElement.setCustomValidity("");
            }
        })
    }


    }

