/* Static description texts.*/


export class Descriptions {

    static controllerInfo() {
        return `
            This is the panel for controlling the TreeWalk.
            The TreeWalk has three states:
            <b>ready</b>, <b>running</b> and <b>paused</b>.
            All these actions are safe to use in all states,
            but some may have no impact in a certain state.
            For example, stopping the TreeWalk when it was running
            will stop the current execution, but stopping when
            the TreeWalk was ready will have no consequences.
            Make sure to wait for the response if you invoked an
            action. You'll see an alert message at the bottom
            once the action has finished.
            Especially starting the TreeWalk might take some time
            due to the generation of the work packages.
        `;
    }

    static actionStop() {
        return `
            <b>Stop</b> the current execution.
            If the TreeWalk is ready, the action will be ignored.
            Otherwise, the running/paused execution will be aborted.
        `;
    }

    static actionPause() {
        return `
            <b>Pause</b> the current execution.
            If the TreeWalk is ready or already paused,
            the action will be ignored.
            Otherwise, it will pause the current exeution
            so that it can be continued later on.
        `;
    }

    static actionContinue() {
        return `
            <b>Continue</b> a paused execution of the TreeWalk.
            If the TreeWalk is ready or already running,
            the action will be ignored.
            Otherwise, it will continue the currently
            paused execution.
        `;
    }

    static actionShutdown() {
        return `
            <b>Shutdown</b> the TreeWalk entirely.
            Stop a possible current execution and terminate
            all TreeWalk threads.
        `;

    }

    static actionStart() {
        return `
            <b>Start</b> a TreeWalk execution.
            Shows the configuration panel for a manual insertion
            of the configuration data.
        `;
    }

    static configurationHelp(name, text) {
        return `
            <p class="text-left">
                <span class="font-weight-bold">${name} </span>
                ${text}
            </p>
        `;
    }

    static configurationName() {
        let name = "Name";
        let text = `
            The name of the conifguration. It should be a short
            name that describes the purpose of the configuration,
            e.g. <code>My vacation pictures</code>.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationAuthor() {
        let name = "Author";
        let text = `
            The author of the conifguration. This field is set to the username
            that is currently logged in.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationDescription() {
        let name = "Description";
        let text = `
            A more detailed description of the configuration that
            explains its purpose.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationStart() {
        let name = "Start";
        let text = `
            Start timestamp of the configuration. It <b>must</b>
            be according to the format
            <code>'YEAR-MONTH-DAYS HOURS:MINUTES:SECONDS'</code>,
            e.g. <code>'2020-07-22 10:15:00'</code>.
            This is due the internal implementation of the TreeWalk.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationInterval() {
        let name = "Interval";
        let text = `
            This defines the interval in which the configuration
            is executed periodically. Input the number of hours
            and days the in which the execution should be repeated.
            If the configuration should only be executed once,
            leave both values as <code>0</code>.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationDirectories() {
        let name = "Directories";
        let text = `
            Please input the list of directories separated by
            <code>;</code> in the following way:
            <code>directoryA, True ; directoryB, False ; ...</code>.
            This input will crawl <code>directoryA</code> recursively
            and only files that are directly located in
            <code>directoryB</code>.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationCPULevel() {
        let name = "CPU-Level";
        let text = `
            This an indicator for how many CPU cores will be used.
            Setting this value to <code>4</code> will use all
            available physical cores, the value <code>1</code>
            will result in using about one quarter of the
            available cores.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationPackageSize() {
        let name = "Package-Size";
        let text = `
            This setting defines how many files
            are combined in one work package for processing.
            Directories with a large amount of files are split up and directories
            with a small amount of files are combined according to this
            value in order to use the resources more efficently.
            A very small value for this setting results in the TreeWalk being
            more responsive, e.g. stopping the TreeWalk during an execution
            will be faster. On the other hand, performance will be slowed down
            due to additional overhead. A large value will result in an opposite
            behaviour.
            Please provide a number between <code>10</code>
            and <code>1000</code> here.
            A reliable default value is <code>100</code>.
        `;
        return Descriptions.configurationHelp(name, text);
    }

    static configurationForceUpdate() {
        let name = "Force-Update";
        let text = `
            If you want to stop a possible currently running
            execution and run the new one, set the value
            to <code>Yes</code>, otherwise <code>No</code>.
        `;
        return Descriptions.configurationHelp(name, text);
    }

}
