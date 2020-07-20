/* Configuration panel for time intervals for maximum resource consumption.

The admin can add/delete time intervals for maximum resource consumption
using this interface.
*/


import {Page} from "../Page";
import {Message} from "./components/Message";
import {IntervalForm} from "./components/IntervalForm";
import {Interval} from "./components/Interval";


export class CrawlerIntervals extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        // Page
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "TreeWalk Intervals";
        this.titleActive = false;
        this.cacheLevel = 3;
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
        // Custom
        this.intervalForm = new IntervalForm();
        this.timeIntervals = null;
        this.updateTimer = null;
        this.hideTimeout = 1000;
        this.hideTimeoutInstant = 1;
        this.refreshInterval = 60000;
    }

    static renderDescription() {
        return `
            <p style="text-align: left">
                This is the configuration panel for the administration of time
                intervals for maximum resource consumption. These time intervals
                can be added and deleted using the form and the remove buttons on
                each item. They are periodically defined for each week.
                The page is refreshed each minute or
                upon adding/deleting time intervals. If you want to update it
                manually, just click the refresh button.
            </p>
        `;
    }

    content() {
        return `
            <div class="container">
                <div class="row mt-3 mb-3">
                    <div class="col-12 mb-3" align="center">
                        <h1>Intervals</h1>
                        ${CrawlerIntervals.renderDescription()}
                    </div>
                    <div class="col-12 mb-2" align="center">
                        ${this.intervalForm.render()}
                    </div>
                </div>
                <div class="row mt-3 mb-3">
                    <div id="messages-interval" class="col">
                    </div>
                </div>
                <div class="row mt-3 mb-3">
                    <div id="intervals" class="col">
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        let self = this;
        $(`#${this.intervalForm.formID}`).on("submit", function (e) {
            e.preventDefault();
            self.addInterval();
        });
        $(`#${this.intervalForm.refreshID}`).on("click", function (e) {
            self.update(self.hideTimeout)
        });
        $(document).on('click', `.${Interval.getClassButtonRemove()}`, function() {
            let identifier = $(this).data("identifier");
            self.removeInterval(identifier);
        });
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
        let intervals = $("#intervals");
        intervals.hide(this.hideTimeoutInstant);
    }

    update(hideTimeout) {
        let self = this;
        let intervals = $("#intervals");
        this.restAPIFetcherCrawler.fetchGet("intervals/list", function (event) {
            intervals.hide(hideTimeout, "swing", function() {
                intervals.html("");
                let timeIntervals = event.data.message;
                self.timeIntervals = timeIntervals;
                self.renderIntervals();
                intervals.show(self.hideTimeout);
            });
        });
    }

    renderIntervals() {
        let self = this;
        let intervals = $("#intervals");
        let interval = null;
        self.timeIntervals.forEach(function(value, index, arr) {
            interval = new Interval(value);
            intervals.append(interval.render());
        });
    }

    addInterval() {
        let startDay = $(`#${this.intervalForm.startDayID}`).val();
        let startHours = IntervalForm.parseNumberString(
            $(`#${this.intervalForm.startHoursID}`).val()
        );
        let startMinutes = IntervalForm.parseNumberString(
            $(`#${this.intervalForm.startMinutesID}`).val()
        );
        let endDay = $(`#${this.intervalForm.endDayID}`).val();
        let endHours = IntervalForm.parseNumberString(
            $(`#${this.intervalForm.endHoursID}`).val()
        );
        let endMinutes = IntervalForm.parseNumberString(
            $(`#${this.intervalForm.endMinutesID}`).val()
        );
        let cpu = $(`#${this.intervalForm.cpuLevelID}`).val();
        let start = `${startDay}:${startHours}:${startMinutes}`;
        let end = `${endDay}:${endHours}:${endMinutes}`;
        let url = `intervals/add?start=${start}&end=${end}&cpu=${cpu}`;
        let self = this;
        let messages = $("#messages-interval");
        self.restAPIFetcherCrawler.fetchGet(url, function (event) {
            let message = new Message(event.data);
            messages.append(message.render());//.hide().fadeIn(self.hideTimeout);
            message.fadeIn(self.hideTimeout);

            if (message.success) {
                self.update(self.hideTimeout);
            }
        });
    }

    removeInterval(identifier) {
        let self = this;
        let url = `intervals/remove?id=${identifier}`;
        let messages = $("#messages-interval");
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

}
