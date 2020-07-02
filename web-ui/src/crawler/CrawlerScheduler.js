/* List of all scheduled executions.

The scheduler lists all planned executions. The admin can review the configuration
of a certain execution or remove it completely from the schedule.
*/

import {Page} from "../Page";
import {Message} from "./components/Message";
import {Task} from "./components/Task";

export class CrawlerScheduler extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        // Page
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Crawler Scheduler";
        this.titleActive = false;
        this.cacheLevel = 3;
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
        // Custom
        this.tasks = null;
        this.updateTimer = null;
        this.hideTimeout = 1000;
        this.hideTimeoutInstant = 1;
        this.refreshInterval = 60000;
    }

    content() {
        return `
            <div class="container">
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h1>Schedule</h1>
                    </div>
                </div>
                <div class="row mt-3 mb-3">
                    <div id="messages-scheduler" class="col">
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
        this.update(this.hideTimeoutInstant);
        this.updateTimer = setInterval(function () {
            self.update(self.hideTimeout)
        }, this.refreshInterval);
    }

    onUnLoad() {
        clearInterval(this.updateTimer);
        let schedule = $("#schedule");
        schedule.hide(this.hideTimeoutInstant);
    }

    onMount() {
        let self = this;
        $(document).on('click', `.${Task.getClassButtonRemove()}`, function() {
            let identifier = $(this).data("identifier");
            self.removeTask(identifier);
        });
    }

    update(hideTimeout) {
        let self = this;
        let schedule = $("#schedule");
        this.restAPIFetcherCrawler.fetchGet("schedule/list", function (event) {
            schedule.hide(hideTimeout, "swing", function() {
                schedule.html("");
                let tasks = event.data.message;
                tasks = tasks.sort((t1, t2) => t1.timestamp.localeCompare(t2.timestamp));
                self.tasks = tasks;
                let pending = tasks.filter(task => task.pending);
                let notPending = tasks.filter(task => !task.pending);
                self.appendSchedule(pending);
                self.appendSchedule(notPending);
                schedule.show(self.hideTimeout);
            });
        });
    }

    removeTask(identifier) {
        let self = this;
        let url = `schedule/remove?id=${identifier}`;
        let messages = $("#messages-scheduler");
        this.restAPIFetcherCrawler.fetchGet(url, function (event) {
            let response = event.data;
            let message = new Message(response);
            messages.append(message.render());//.hide().fadeIn(self.hideTimeout);
            message.fadeIn(self.hideTimeout);


            if (response.success) {
                self.update(self.hideTimeout);
            }
        });
    }

    appendSchedule(tasks) {
        let schedule = $("#schedule");
        let task = null;
        tasks.forEach(function(value, index, arr) {
            task = new Task(value);
            schedule.append(task.render());
            task.addListeners();
        });
    }

}
