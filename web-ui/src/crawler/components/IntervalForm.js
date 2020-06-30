/* Type definition of the form for adding time intervals */


export class IntervalForm {

    constructor() {
        this.formID = "form-interval";
        this.refreshID = "refresh-interval";
        this.startDayID = "start-day";
        this.startHoursID = "start-hours";
        this.startMinutesID = "start-minutes";
        this.endDayID = "end-day";
        this.endHoursID = "end-hours";
        this.endMinutesID = "end-minutes";
        this.cpuLevelID = "cpu-level";
    }

    static parseNumberString(input) {
        return (input.length === 1) ? `0${input}` : input;
    }

    static renderInputDay(id) {
        return `
            <select class="form-control" id=${id}>
                <option value="00">Monday</option>
                <option value="01">Tuesday</option>
                <option value="02">Wednesday</option>
                <option value="03">Thursday</option>
                <option value="04">Friday</option>
                <option value="05">Saturday</option>
                <option value="06">Sunday</option>
            </select>
        `
    }

    static renderInputNumber(id, min, max, placeholder) {
        return `
            <input
                type="number"
                class="form-control"
                placeholder=${placeholder}
                id=${id}
                min=${min}
                max=${max}
            >
        `;
    }

    static renderTimeInput(id, name) {
        let idTimeDay = `${id}-day`;
        let idTimeHours = `${id}-hours`;
        let idTimeMinutes = `${id}-minutes`;
        return `
            <div class="form-group row" id=${id}>
                <label class="col-sm-3 col-form-label config-input-label">${name}</label>
                <div class="col-sm-3">
                    ${IntervalForm.renderInputDay(idTimeDay)}
                </div>
                <div class="col-sm-3">
                    ${IntervalForm.renderInputNumber(idTimeHours, 0, 23, "Hours")}
                </div>
                <div class="col-sm-3">
                    ${IntervalForm.renderInputNumber(idTimeMinutes, 0, 59, "Minutes")}
                </div>
            </div>
        `;
    }

    static renderCPULevel() {
        return `
            <div class="form-group row">
                <label class="col-sm-3 col-form-label config-input-label">CPU Level</label>
                <div class="col-sm-3">
                    ${IntervalForm.renderInputNumber("cpu-level", 1, 4, "CPU Level")}
                </div>
            </div>
        `;
    }

    static renderButtons() {
        return `
            <div class="form-group row pt-3">
                <div class="col-12" align="center">
                    <button
                        type="submit"
                        class="btn btn-primary font-weight-bold mr-3"
                    >
                        SUBMIT
                    </button>
                    <button
                        id="clear-config"
                        type="reset"
                        class="btn btn-danger font-weight-bold mr-3"
                    >
                        CLEAR
                    </button>
                    <button
                        id="refresh-interval"
                        type="button"
                        class="btn btn-info font-weight-bold"
                    >
                        Refresh
                    </button>



                </div>
            </div>
        `;
    }

    render() {
        return `
            <form id=${this.formID}>
                ${IntervalForm.renderTimeInput("start", "Start")}
                ${IntervalForm.renderTimeInput("end", "End")}
                ${IntervalForm.renderCPULevel()}
                ${IntervalForm.renderButtons()}
            </form>
        `;
    }

}
