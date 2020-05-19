
import React from 'react';
import ReactDOM from 'react-dom';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {Page} from "../Page";

export class GraphiqlConsole extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "GraphiQl-Console";
    }

    content() {
        return `<div id="my-graphi-console" style="height:500px;"></div>`;
    }

    onMount() {

        function graphQLFetcher(graphQLParams) {
            return fetch('localhost:8080/graphql', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(graphQLParams),
            }).then(response => response.json());


        }

        ReactDOM.render(
            React.createElement(GraphiQL, {fetcher: graphQLFetcher}),
            document.getElementById('my-graphi-console'),

        );

        //ReactDOM.render(<GraphiQL fetcher={graphQLFetcher} />, document.body);


    }

}
