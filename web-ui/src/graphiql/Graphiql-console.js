import {Page} from "../Page";
import React from 'react';
import ReactDOM from 'react-dom';
import "graphiql/graphiql.min.css";
import GraphiQL from 'graphiql';


export class GraphiqlConsole extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "GraphiQl-Console";
        this.titleActive = false; //It is not necessary to show there information, its redundant and space-wasting
        this.init = false;
        this.cacheLevel = 3;
        this.graphQlFetcher=this.parent.dependencies.graphQlFetcher;

        this.signalToRemoveGoBackToEditor = false;
        console.log(parent);
    }

    content() {
        return "";
    }

    onMount() {
        let thisdata = this;

        //is important to be also here, cause of rendering problems else
        $("#graphql-stuff").removeClass("hide_active");


        let graphiqlReact;
        let querydata = `query{}`;
        if (this.parent.storage.query_inject !== null) {
            querydata = this.parent.storage.query_inject;
            this.parent.storage.query_inject = null;
        }


        if (this.parent.storage.openedFromEditor) {
            $("#small-nav-bar").append(`
            <div class="row justify-content-md-center go-to-editor-div mb-3">
            <button type="button" class="btn btn-primary go-to-editor">Go Back To Editor</button>
            </div>
            `);
            this.parent.storage.openedFromEditor = false;
            this.signalToRemoveGoBackToEditor = true;

            $(".go-to-editor").click(function () {
                $("#nav-element-query-editor").trigger("click");
            });
        }

        function graphQLFetcher(graphQLParams) {
            return thisdata.graphQlFetcher.fetchC(graphQLParams)
                .then(response => response.json());
        }

        graphiqlReact = React.createElement(GraphiQL, {
            fetcher: graphQLFetcher,
            query: querydata,
            docExplorerOpen: true
        });


        ReactDOM.render(graphiqlReact, document.getElementById('graphql-stuff'));

    }

    onUnMount() {
        ReactDOM.unmountComponentAtNode(document.getElementById('graphql-stuff'));
    }

    onUnLoad() {
        $("#graphql-stuff").addClass("hide_active");

        if (this.signalToRemoveGoBackToEditor) {
            this.signalToRemoveGoBackToEditor = false;
            $(".go-to-editor-div").remove();
        }
    }

    onLoad() {

        if (this.parent.storage.query_inject !== null) {
            this.clearCache();
            this.reload();
        } else {
            $("#graphql-stuff").removeClass("hide_active");
        }

    }

}
