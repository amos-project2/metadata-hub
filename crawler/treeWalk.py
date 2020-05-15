import multiprocessing
import os
import argparse
import random
import subprocess
import json
import time
from concurrent.futures.thread import ThreadPoolExecutor
from sys import exit
from typing import Tuple, List

import crawler.services.tracing as tracing


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

# TODO This function should ultimately be used to create a list of even work packages
def naiveCreateWorkpackages(pathInput: str, recursive:bool) -> Tuple[List[str],str]:
    """Creates a list of every directory found in the give paths file tree.

    Args:
        pathInput (str): Path to the directory we want to walk.

    """
    #: Initialize tracing
    # FIXME
    alreadyProcessed = TRACER.get_processed_nodes()
    traceFile = TRACER._trace_file
    print(f'Initialized with {len(alreadyProcessed)} already processed nodes.')

    directoryList = []
    for root, directories, files in os.walk(pathInput):
        # Skip node if it is already processed
        if root in alreadyProcessed:
            relativePath = os.path.relpath(root, pathInput)
            print(f'Skip node \'{relativePath}\': already processed.')
            if recursive == 0:
                break
            continue
        directoryList.append(root)
        if recursive == 0:
            break
    return directoryList, traceFile

def naiveTreeWalk(pathExifTool: str, pathProtocol: str, directory:str, traceFile:str) -> None:
    """Naive implementation of the tree walk. logs the results in Json format.

    Args:
        pathExifTool (str): Path to the exiftool.
        pathProtocol (str): Path to the output directory
        directory (str): The directory to scan
        traceFile (str): The trace file
    """

    #: Debugging variable to check how many exiftool scans fail
    failures = []
    #: variable to give protocol files a name
    logCount = random.randint(1,2000000)
    #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
    try:
        with open(f'{pathProtocol}/protocol{logCount}.json', 'w') as myFile:
            subprocess.check_call([f'{pathExifTool}', '-json', directory], stdout=myFile)
            TRACER.add_node(directory)
    except subprocess.CalledProcessError:
        failures.append(directory)

# def naiveTreeWalkTest(pathExifTool: str, pathProtocol: str, directory:List[str], traceFile:str) -> None:
#     """Naive implementation of the tree walk. logs the results in Json format. Only exist for testing the single thread
#         treewalk!
#     """
#     #: Debugging variable to check how many exiftool scans fail
#     failures = []
#     for direct in directory:
#         #: variable to give protocol files a name
#         logCount = random.randint(1,2000000)
#         #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
#         try:
#             with open(f'{pathProtocol}/protocol{logCount}.json', 'w') as myFile:
#                 subprocess.check_call([f'{pathExifTool}', '-json', direct], stdout=myFile)
#                 # FIXME
#                 TRACER.add_node(direct)
#         except subprocess.CalledProcessError:
#             failures.append(direct)

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

def err(message: str) -> None:
    """Helper function to display error message and exit.

    Args:
        message (str): message to display before exiting

    """
    print(message)
    exit(1)


if __name__ == "__main__":

    #: Load the config files data
    with open('configCrawler.json') as jsonData:
        data = json.load(jsonData)

    #: Check for invalid input
    if not os.path.isfile(data['paths']['exiftool']):
        err(f'ExifTool \'{data["paths"]["exiftool"]}\' does not exist.')
    for directory in data['paths']['inputs']:
        if not os.path.isdir(directory['path']):
            err(f'Input directory \'{data["paths"]["inputPath"]}\' does not exist.')
    if not os.path.isdir(data['paths']['output']):
        err(f'Output directory \'{data["paths"]["outputPath"]}\' does not exist.')

    #: Set the number of threads according to input
    powerLevel = 0
    if data['options']['powerLevel'] == 4:
        powerLevel = multiprocessing.cpu_count()
    elif data['options']['powerLevel'] == 3:
        powerLevel = multiprocessing.cpu_count() * 0.75
    elif data['options']['powerLevel'] == 2:
        powerLevel = multiprocessing.cpu_count() * 0.5
    elif data['options']['powerLevel'] == 1:
        powerLevel = multiprocessing.cpu_count() * 0.25
    else:
        err(f'Please chose a power level between 1 and 4')

    # FIXME
    TRACER = tracing.Tracer(data)

    #: gather the given input directories contents
    roots = []
    for directory in data['paths']['inputs']:
        roots.append(naiveCreateWorkpackages(directory['path'], directory['recursive']))
    print(roots)
    #: Run the tree walk in parallel
    start = time.time()

    for package in roots:
        with ThreadPoolExecutor(max_workers=powerLevel) as executor:
            for directory in package[0]:
                future = executor.submit(naiveTreeWalk, data['paths']['exiftool'], data['paths']['output'], directory, package[1])

    end = time.time()
    print(end - start)
    pass
