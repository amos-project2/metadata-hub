

export class GraphQlFetcher {

    constructor(endpoint) {
        this.endpoint = endpoint;
        // const URL = "graphql/";
    }

    //it returns a future
    fetchA(query, variables) {
        return this.fetchHelper(JSON.stringify({query: query, variables: variables}));
    }

    //it returns a future
    fetchB(query) {
        return this.fetchHelper(JSON.stringify({query: query}));
    }

    //it returns a future
    fetchC(graphQLParams) {
        return this.fetchHelper(JSON.stringify(graphQLParams));
    }

    //private, and returns a future
    fetchHelper(body) {
        return fetch(this.endpoint, {
            crossOrigin: null,
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: body
        });
    }


    fetchAdvanced(query, func) {

        this.fetchB(query).then(function (response) {
            if (response.ok)
                return response.json();
            else {
                //func(false, null, 'Error in the HTTP-Answer');
                throw new Error('HTTP-ERROR: ' + response.statusText);
            }
        })
            .then(function (json) {
                func(true, json, JSON.stringify(json, undefined, 2));
            })
            .catch(function (err) {
                func(false, null, err.message);
            });

    }


}
