import {Page} from "../Page";

export class GraphqlQueryEditor extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "GraphQl Query Editor";
    }

    content() {
        return `
<form class="q-send-query-editor">
<div class="form-group" >
 <label for="q_textInput">GraphQL</label>
 <textarea class="form-control" id="q_textInput" rows="10" placeholder="query\n{\n  {\n\n  }\n}"></textarea>
</div>
  <button type="submit" class="btn btn-primary">Send</button>
</form>
<br>
<h4>Result:</h4>
<div>
<pre id="json" class="q_result"></pre>
</div>


        `;
    }

    onMount() {

        $(".q-send-query-editor").submit(function (event) {
            event.preventDefault();
            // alert($("#q_textInput").val());
            const URL = "graphql/";
           // const URL = "http://localhost:8080/graphql/";

            fetch(URL, {
                crossOrigin: null,
                method: "post",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({query: $("#q_textInput").val()})
            }).then(function (response) {
                console.log(response);
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Error in the HTTP-Answer');
            })
                .then(function (json) {
                    $(".q_result").text(JSON.stringify(json, undefined, 2));
                })
                .catch(function (err) {
                    $(".q_result").text("Error: " + err);
                });


        });

    }

}


