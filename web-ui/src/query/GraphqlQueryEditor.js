import {Page} from "../Page";

export class GraphqlQueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "GraphQl Query Editor";
        this.cacheLevel = 3;
        this.graphQlFetcher=this.parent.dependencies.graphQlFetcher;
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
<pre class="q_result3"></pre>
</div>


        `;
    }

    onMount() {

        let thisdata=this;
        $(".q-send-query-editor").submit(function (event) {
            event.preventDefault();
            thisdata.graphQlFetcher.fetchAdvanced($("#q_textInput").val(), function (sucess, json, jsonString) {
                $(".q_result3").text(jsonString);
            });


        });

    }

}


