export class DateRangeFilter {


    constructor() {

    }

    getMainHtmlCode() {

        return `
         <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStart">Start-DateTime (File created)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (created-time) than Start-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeStart" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEnd">End-DateTime (File created)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (created-time) than End-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeEnd" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>



                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeStartUpdated">Start-DateTime (File modified)<a class="pover" title="Start-DateTime" data-content="It collects all files, which are older (modified-time) than Start-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeStartUpdated" placeholder="2020-05-22 07:19:29">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fq-createFileTimeRangeEndUpdated">End-DateTime (File modified)<a class="pover" title="End-DateTime" data-content="It collects all files, which are younger (modified-time) than End-DateTime">[?]</a></label>
                        <input type="datetime-local" class="form-control" id="fq-createFileTimeRangeEndUpdated" placeholder="2020-07-28 20:35:22">
                    </div>
                </div>
                `;
    }


    onMount() {

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


}

