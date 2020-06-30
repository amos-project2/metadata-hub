/* Static description texts.*/


export class Descriptions {

    static controllerInfo() {
        return `
            This is the panel for controlling the crawler.
            The crawler has three states:
            <b>ready</b>, <b>running</b> and <b>paused</b>.
            All these actions are safe to use in all states,
            but some may have no impact in a certain state.
            For example, stopping the crawler when it was running
            will stop the current execution, but stopping when
            the crawler was ready will have no consequences.
            Make sure to wait for the response if you invoked an
            action. You'll see an alert message at the bottom
            once the action has finished.
            Especially starting the crawler might take some time
            due to the generation of the work packages.
        `;
    }

    static actionStop() {
        return `
            <b>Stop</b> the current execution.
            If the crawler is ready, the action will be ignored.
            Otherwise, the running/paused execution will be aborted.
        `;
    }

    static actionPause() {
        return `
            <b>Pause</b> the current execution.
            If the crawler is ready or already paused,
            the action will be ignored.
            Otherwise, it will pause the current exeution
            so that it can be continued later on.
        `;
    }

    static actionContinue() {
        return `
            <b>Continue</b> a paused execution of the crawler.
            If the crawler is ready or already running,
            the action will be ignored.
            Otherwise, it will continue the currently
            paused execution.
        `;
    }

    static actionShutdown() {
        return `
            <b>Shutdown</b> the crawler entirely.
            Stop a possible current execution and terminate
            all crawler threads.
        `;

    }

    static actionStart() {
        return `
            <b>Start</b> a crawler execution.
            Shows the configuration panel for a manual insertion
            of the configuration data.
        `;
    }

}
