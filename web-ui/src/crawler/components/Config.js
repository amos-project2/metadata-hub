

export class Config {

    constructor(
            name,
            author,
            description,
            start,
            intervalHours,
            intervalDays,
            directories,
            platform,
            cpuLevel,
            packageSize,
            forceUpdate,
    ) {
        this.intervalDays = intervalDays;
        this.intervalHours = intervalHours;
        this.directories = directories;
        this.cpuLevel = cpuLevel;
        this.packageSize = packageSize;
        this.forceUpdate = forceUpdate;
        this.data = {
            "name": name,
            "author": author,
            "description": description,
            "time": {
                "start": start,
                "interval": 0,
            },
            "directories": [],
            "options": {
                "cpu-level": 0,
                "package-size": 0,
                "platform": platform,
                "force-update": false
            }
        };
    }

    parse() {
        let directories = this.parseDirectories();
        if (directories === null) {return null;}
        this.data["time"]["interval"] = this.parseInterval();
        this.data["directories"] = directories;
        this.data["options"]["cpu-level"] = parseInt(this.cpuLevel);
        this.data["options"]["package-size"] = parseInt(this.packageSize);
        this.data["options"]["force-update"] = this.forceUpdate === "true";
        return this.data;
    }

    parseInterval() {
        let hoursSeconds = parseInt(this.intervalHours) * 3600;
        let daysSeconds = parseInt(this.intervalDays) * 86400;
        return hoursSeconds + daysSeconds;
    }

    parseDirectories() {
        let directoriesArray = [];
        try {
            let splits = this.directories.split(";");
            splits.forEach(function (item) {
                let path = item.split(",")[0].trim();
                let recursive = item.split(",")[1].trim().toLowerCase();
                let recursive_flag = false;
                if (recursive === "true") {
                    recursive_flag = true;
                } else if (recursive === "false") {
                    recursive_flag = false;
                } else {
                    throw "Invalid recursive option";
                }
                directoriesArray.push({
                    "path": path,
                    "recursive": recursive_flag
                });
            });
        } catch (err) {
            return null;
        }
        return directoriesArray;
    }

}
