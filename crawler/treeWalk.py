#TODO Add logging of already passed directories
#TODO Add debugging logging
#TODO Add CPU-Check
#TODO Add Multi Thread

import os
import argparse
import subprocess
from sys import exit
from typing import Tuple, List


TRACE_FILE = 'TRACE.log'


def addProcessedEntry(path: str, traceFile: str) -> None:
    """Add a path to the given trace file.

    Args:
        path (str): path of the processed node
        traceFile (str): path of current trace file

    """
    with open(traceFile, 'a') as traceFilePointer:
        traceFilePointer.write(f'{path}\n')


def initTrace(pathProtocol: str, clear: bool) -> Tuple[List[str], str]:
    """Initialize the trace file and the nodes which should be skipped.

    If clear is set to true, all existing trace data is removed.

    Args:
        pathProtocol (str): path of the output directory
        clear (bool): clear existing trace data

    Returns:
        Tuple[List[str], str]: list of already processed nodes, path of trace file

    """
    traceFile = os.path.join(pathProtocol, TRACE_FILE)
    alreadyProcessed = []
    # Remove all content in the trace file
    if clear:
        open(traceFile, 'w').close()
        return (alreadyProcessed, traceFile)
    # Read trace data or create empty trace file if no data exists yet
    if os.path.isfile(traceFile):
        with open(traceFile, 'r') as traceFilePointer:
            alreadyProcessed = [entry.rstrip() for entry in traceFilePointer.readlines()]
    else:
        open(traceFile, 'a').close()
    return (alreadyProcessed, traceFile)


def naiveTreeWalk(pathExifTool: str, pathInput: str, pathProtocol: str, clear: bool) -> None:
    """Naive implementation of the tree walk. logs the results in Json format.

    Args:
        pathExifTool (str): Path to the exiftool.
        pathInput (str): Path to the directory we want to walk.
        pathProtocol (str): Path to the output directory
        clear (bool): clear trace data beforehand

    """
    #: Initialize tracing
    alreadyProcessed, traceFile = initTrace(pathProtocol, clear)
    print(f'Initialized with {len(alreadyProcessed)} already processed nodes.')

    #: Debugging variable to check how many exiftool scans fail
    failures = []
    #: variable to count how many files have been written
    logCount = 0
    #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
    for root, directories, files in os.walk(pathInput):
        logCount += 1
        # Skip node if it is already processed
        if root in alreadyProcessed:
            relativePath = os.path.relpath(root, pathInput)
            print(f'Skip node \'{relativePath}\': already processed.')
            continue
        try:
            with open(f'{pathProtocol}/protocol{logCount}.json', 'w') as myFile:
                subprocess.check_call([f'{pathExifTool}', '-json', root], stdout=myFile)
                addProcessedEntry(root, traceFile)
        except subprocess.CalledProcessError:
            failures.append(root)


def hashTable(pathInput):
    """Creates a hash table based on the total amount of files per directory.

    Args:
        pathExifTool: Path to the exiftool.

    Returns:
        dictionary with directories maped to amount of files

    """
    directoryDictionary = dict()
    for root, directories, files in os.walk(pathInput):
        if len(files) in directoryDictionary:
            directoryDictionary[len(files)].append(root)
        else:
            directoryDictionary[len(files)] = [root]
    return directoryDictionary


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments.

    Returns:
        argparse.Namespace: command line arguments

    """
    parser = argparse.ArgumentParser(description='MetaHub Filesystem Crawler')
    parser.add_argument(
        'exiftool',
        type=str,
        nargs=None,
        help='path of the ExifTool executable'
    )
    parser.add_argument(
        'input',
        type=str,
        nargs=None,
        help='path of the input directory'
    )
    parser.add_argument(
        'output',
        type=str,
        nargs=None,
        help='path of the output directory'
    )
    parser.add_argument(
        '--clear',
        dest='clear',
        action='store_true',
        help='clear the Trace if it exists'
    )
    return parser.parse_args()


def err(message: str) -> None:
    """Helper function to display error message and exit.

    Args:
        message (str): message to display before exiting

    """
    print(message)
    exit(1)


if __name__ == "__main__":
    args = parse_arguments()
    if not os.path.isfile(args.exiftool):
        err(f'ExifTool \'{args.exiftool}\' does not exist.')
    if not os.path.isdir(args.input):
        err(f'Input directory \'{args.input}\' does not exist.')
    if not os.path.isdir(args.output):
        err(f'Output directory \'{args.output}\' does not exist.')
    naiveTreeWalk(
        pathExifTool=args.exiftool,
        pathInput=args.input,
        pathProtocol=args.output,
        clear=args.clear,
    )


# #: For testing (put your on paths into the variables)
# #: Write paths in Windows with \\ between directorises: C:\\Thomas
# #: Write paths in Linux with / between directories: /home/thomas
# #: <pathExifTool> Linux: path to the exiftool.
# pathExifTool = '/home/thomas/Documents/master/amos/metadata-hub/crawler/exiftool/exiftoolLinux/exiftool'
# #: <pathExifTool> Window: path to the exiftool.
# pathExifTool = '...\\metadata-hub\\crawler\\exiftool\\exiftoolWindows\\exiftool.exe';
# #: <pathInput>: path to folder you want to check
# pathInput = '/home/thomas/Downloads/TESTY'
# #: <pathProtocol>:
# pathProtocol = 'protocol'
# #: for testing purposes
# naiveTreeWalk(pathExifTool, pathInput, pathProtocol)
# dictionary = hashTable(pathInput)
# for entry in dictionary:
#     print(f'{entry}:  {dictionary[entry]}')
