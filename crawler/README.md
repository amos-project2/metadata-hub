# Filesystem Crawler
This directory contains the tree walk algorithm that is used to crawl a given directory for image metadata. The data is
extracted by using the [ExifTool](https://exiftool.org/) crawler.

## Table of contents

- [Filesystem Crawler](#Filesystem-Crawler)
  - [Table of contents](#table-of-contents)
  - [Usage](#Usage)
  - [FAQ](#FAQ)

### Usage
The crawler can be executed on the command line by using Python 3.8:
```console
hub@metadata:~$ python3.8 treeWalk.py
```
The different arguments can be configured in the [configCrawler.json](configCrawler.json) file. The different variables are defined as:
* **inputs**: List of root objects. Each root object contains a path to a directory and a boolean to enable the recursive
processing option. If this option is set to false, only the given directory will be analyzed, otherwise all
subdirectories will also be scanned.
* **output**: Path to a directory where the output will be stored.
* **trace**: Path to a trace file. This will be used to keep track of the tree walks path.
* **exiftool**: Path to the binary of the exiftool.
* **powerlevel**: Determines how many threads are going to be deployed during the execution of the script.
    * 1: Uses about 25% of the CPU
    * 2: Uses about 50% of the CPU
    * 3: Uses about 75% of the CPU
    * 4: Uses about 100% of the CPU
* **clearTrace**: Determines whether the already processed directories from a previous execution are going to be
scanned again.
* **filetypes**: Array of string containing the different file types the exiftool is supposed to look for. Leave this
empty to scan for all file types.
* **language**: This feature is currently being worked on.
### FAQ
**What is the current state of the crawler?**

The script is currently implemented in a naive way. The crawler simply creates an archive of every directory it is
supposed to crawl and then executes the exiftool on each of these directories. It is able to do so at different
performance levels depending on the system availability (See Usage for options).

**How do you plan to improve the crawler?**

The final version of the crawler is supposed to conduct the tree walk intelligently. Thus, we will work on splitting
the given directories in an even way. To do so, we are planning to improve the algorithm by taking the amount of files
per directory into account while scanning for work packages.

**How does the script act if the operation is canceled during it's execution?**

The script uses a tracing algorithm to keep track of the directories it has previously visited. It can either restart
from the state it was in during cancellation or start from the beginning again.

**Is it possible to store the results in a database?**

This feature is currently being worked on. It will ultimately work with the database and server implementation found in
the root directory of this project.
