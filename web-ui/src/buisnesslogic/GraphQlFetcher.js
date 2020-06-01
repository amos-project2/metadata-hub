export class GraphQlFetcher {

    constructor(endpoint) {
        this.endpoint = endpoint;
        // const URL = "graphql/";
    }

    //it returns a future
    fetchFromServerA(query, variables) {
        return this.fetchFromServerHelper(JSON.stringify({query: query, variables: variables}));
    }

    //it returns a future
    fetchFromServerB(query) {
        return this.fetchFromServerHelper(JSON.stringify({query: query}));
    }

    //it returns a future
    fetchFromServerC(graphQLParams) {
        return this.fetchFromServerHelper(JSON.stringify(graphQLParams));
    }

    //private, and returns a future
    fetchFromServerHelper(body) {
        return fetch(this.endpoint, {
            crossOrigin: null,
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: body
        });
    }


}
