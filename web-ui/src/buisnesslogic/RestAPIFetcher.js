export class RestAPIFetcher {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }


    fetchPost(path, formData, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "post",
            body: formData
        });

        this.fetchToResult(promise, callback);
    }


    fetchGet(path, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "get",
        });

        this.fetchToResult(promise, callback);
    }


    fetchJson(path, jsonData, callback) {
        let promise = fetch(this.urlBuilder(path), {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });

        this.fetchToResult(promise, callback);
    }

    //private
    urlBuilder(path) {
        return this.endpoint + "/" + path;
    }


    //private
    fetchToResult(promise, callback) {

        promise.then(function (response) {
            if (response.ok)
                return response.json();
            else {
                  throw new Error('HTTP-ERROR: ' + response.statusText);
            }
        })
            .then(function (json) {
                callback(new FetchResult(FetchResult.SUCCESS(), "", json))
            })
            .catch(function (err) {
                if (err.message.includes("HTTP-ERROR: ")) {
                    callback(new FetchResult(FetchResult.HTTP_ERROR(), err.message, null));
                } else {
                    callback(new FetchResult(FetchResult.NETWORK_ERROR(), err.message, null));
                }

            });

    }


}

class FetchResult {

    static SUCCESS(){return 1;} //const
    static NETWORK_ERROR(){return 2;}//const
    static HTTP_ERROR(){return 3;}//const
    static AUTH_ERROR(){return 4;}//const
    static CRAWLER_NOT_REACHABLE(){return 5;}//const


    constructor(status, errorMessage, data) {
        this.status = status;
        this.errorMessage = errorMessage;
        this.data = data;
    }
}
