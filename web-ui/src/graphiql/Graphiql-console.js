import {Page} from "../Page";
import React from 'react';
import ReactDOM from 'react-dom';
import "graphiql/graphiql.min.css";
import GraphiQL from 'graphiql';

import fetch from 'isomorphic-fetch';


export class GraphiqlConsole extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "GraphiQl-Console";
        this.init = false;
        this.cacheLevel=3;
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

        //is important to be also here, cause of rendering problems else
        $("#graphql-stuff").removeClass("hide_active");

        if (!this.init) {
            this.init = true;

            let graphiqlReact=React.createElement(GraphiQL, {
                fetcher: graphQLFetcher
            });


            ReactDOM.render(graphiqlReact,document.getElementById('graphql-stuff'));

        }

    }

    onUnMount() {
        ReactDOM.unmountComponentAtNode(document.getElementById('graphql-stuff'));
    }

    onUnLoad() {
        $("#graphql-stuff").addClass("hide_active");
    }

    onLoad() {
        $("#graphql-stuff").removeClass("hide_active");
    }

}
