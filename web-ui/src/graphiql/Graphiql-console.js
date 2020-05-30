import {Page} from "../Page";
import React from 'react';
import ReactDOM from 'react-dom';
import "graphiql/graphiql.min.css";
import GraphiQL from 'graphiql';

 import fetch from 'isomorphic-fetch';


export class GraphiqlConsole extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "GraphiQl-Console";
        this.init = false;
        this.cacheChangesLevel=3;
    }

    content() {
        return "";
        //return `<div id="my-graphi-console" style="height: 80vh; margin: 0"></div>`;
    }

    onMount() {
        const URL = "graphql/";
        // const URL = "http://localhost:8080/graphql/";

        function graphQLFetcher(graphQLParams) {
            return fetch(URL, {
                crossOrigin: null,
                method: "post",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(graphQLParams)
            }).then(response => response.json());

        }

        $("#graphql-stuff").removeClass("hide_active");

        if (!this.init) {
            this.init = true;


            ReactDOM.render(
                React.createElement(GraphiQL, {fetcher: graphQLFetcher}),
                document.getElementById('graphql-stuff')
            );

            //ReactDOM.render(<GraphiQL fetcher={graphQLFetcher} />, document.body);
        }




    }

    onUnMount() {
        $("#graphql-stuff").addClass("hide_active");
    }

}
