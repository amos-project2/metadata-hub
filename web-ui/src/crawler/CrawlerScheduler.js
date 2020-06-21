import {Page} from "../Page";

export class CrawlerScheduler extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "";
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
        this.cacheLevel = 3;
        this.updateTimer = null;
    }

    content() {
        return `
            <div class="container">
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h1>Schedule</h1>
                        <form id="remove-id-form">
                            <div class="form-group row">
                                <div class="col-12 col-md-3 pt-3">
                                    <button type="submit" class="btn btn-primary btn-block font-weight-bold">REMOVE</button>
                                </div>
                                <div class="col-12 col-md-9 pt-3">
                                    <input type="text" class="form-control" id="remove-id">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="row mt-3 mb-3">
                    <div id="messages" class="col">

                    </div>
                </div>
                <div class="row mt-3 mb-3">
                    <div id="schedule" class="col">

                    </div>
                </div>
            </div>
        `;
    }

    onLoad() {
        let self = this;
        self.update();
        this.updateTimer = setInterval(function () {
            self.update()
        }, 60000);
    }

    onUnLoad() {
        clearInterval(this.updateTimer);
    }

    onMount() {
        let self = this;
        $("#remove-id-form").on("submit", function (e) {
            e.preventDefault();
            self.removeID(e);
        });
    }


    update() {
        let self = this;
        let schedule = $("#schedule");
        this.restAPIFetcherCrawler.fetchGet("schedule/list", function (event) {
            schedule.hide(1000, "swing", function() {
                schedule.html("");
                let tasks = event.data.message;
                let pending = tasks.filter(task => task.pending);
                let notPending = tasks.filter(task => !task.pending);
                self.appendSchedule(pending);
                self.appendSchedule(notPending);
                schedule.show(1000);
            });
        });
    }

    renderMessage(response) {
        let status = "Failed!";
        let alertType = "alert-danger";
        if (response.success) {
            status = "Success!";
            alertType = "alert-success";
        }
        return `
            <div class="alert ${alertType} alert-dismissible fade show" role="alert">
                <strong>${status}</strong>
                ${response.message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
    }

    removeID(e) {
        let self = this;
        let id = $("#remove-id").val();
        let url = `schedule/remove?id=${id}`;
        let messages = $("#messages");
        this.restAPIFetcherCrawler.fetchGet(url, function (event) {
            let response = event.data;
            messages.append(self.renderMessage(response));
            if (response.success) {
                self.update()
            }
            $("#remove-id").val("");
        });
    }

    appendSchedule(tasks) {
        let self = this;
        let schedule = $("#schedule");
        let taskHTML = "";
        tasks.forEach(function(value, index, arr) {
            taskHTML = self.renderTask(value);
            schedule.append(taskHTML);
        });
    }

    renderTask(task) {
        console.log(task);
        let statusBadge = null;
        let forceBadge = null;
        if (task.pending) {
            statusBadge = `<span class="badge badge-warning mr-2">PENDING</span>`;
        } else {
            statusBadge = `<span class="badge badge-info mr-2">WAITING</span>`;
        }
        if (task.force) {
            forceBadge = `<span class="badge badge-danger">FORCE</span>`;
        } else {
            forceBadge = ``;
        }
        return `
            <div class="card mt-3">
                <div class="card-header">
                    <div class="row">
                        <div class="col-lg-12 col-xl-10">
                            ${task.identifier}
                        </div>
                        <div class="col-lg-12 col-xl-2">
                            ${statusBadge}
                            ${forceBadge}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">
                        ${task.config.name}
                    </h5>
                    <h6 class="card-title text-secondary">
                        ${task.config.author}
                    </h6>
                    <p class="card-text">
                        ${task.config.description}
                    </p>
                    <p class="card-text">
                        The next execution is scheduled at: <code>${task.timestamp}</code>
                    </p>
                </div>
            </div>
        `;
    }

}
