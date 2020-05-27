import multiprocessing
import os
import argparse
import random
import subprocess
import json
import time
from pprint import pprint
from concurrent.futures import ThreadPoolExecutor, as_completed
from sys import exit
from typing import Tuple, List
from datetime import datetime
from timeit import default_timer as timer
import crawler.services.tracing as tracing
import psycopg2
from psycopg2 import pool
from crawler.connectPG.connector import DatabaseConnection
from crawler.connectPG.extract_data import extractData
from crawler.benchmark.benchmark import Benchmark

TRACE_FILE = 'TRACE.log'


def addProcessedEntry(path: str, traceFile: str) -> None:
    """Add a path to the given trace file.

    Args:
        path (str): path of the processed node
        traceFile (str): path of current trace file

    """
    with open(traceFile, 'a') as traceFilePointer:
        traceFilePointer.write(f'{path}\n')


def naiveCreateWorkpackages(pathInput: str, recursive: bool) -> List[str]:
    """Creates a list of every directory found in the give paths file tree.

    Args:
        pathInput (str): Path to the directory we want to walk.

    """
    #: Initialize tracing
    # FIXME
    alreadyProcessed = TRACER.get_processed_nodes()
    traceFile = TRACER._trace_file
    print(f'Initialized {pathInput} with {len(alreadyProcessed)} already processed nodes.')
    print(alreadyProcessed)
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
    return directoryList


def naiveTreeWalkUpdate(pathExifTool: str, directory: List[str], options: List[str], con: DatabaseConnection,
                        dbID: int, trace:bool) -> None:
    """Naive implementation of the tree walk. inserts the results in Postgre database.

    Args:
        pathExifTool (str): Path to the exiftool.
        pathProtocol (str): Path to the output directory
        directory (str): The directory to scan
        traceFile (str): The trace file
    """
    #: Debugging variable to check how many exiftool scans fail
    failures = []
    #: Walk over every directory and execute the exiftool.
    try:
        process = subprocess.Popen([f'{pathExifTool}', '-json', *directory], stdout=subprocess.PIPE)
        metadata = json.load(process.stdout)
        # Walk through each object/file
        insertions = []
        for file_number in metadata:
            genericID = con.insert_new_record(extractData(file_number).extract_metadata_generic(dbID))
            insertions.extend(extractData(file_number).extract_metadata_eav(dbID, genericID))
        con.insert_new_record("INSERT INTO file_generic_data_eav (tree_walk_id, file_generic_id, attribute, value, unit) VALUES " + ','.join(insertions))
        if bool:
            for dir in directory:
                TRACER.add_node(dir)
    except subprocess.CalledProcessError:
        failures.append(directory)
    except Exception as e:
        print(e)


def splitList(split:List[str], X:int) :
    return lambda split, X: [split[i: i + X] for i in range(0, len(split), X)]


def naiveTreeWalkBenchmark(pathExifTool: str, splitComplete: List[List[str]], options:List[str], 
                           con:DatabaseConnection, dbID:int, trace:bool) -> None:
    """Naive implementation of the tree walk. inserts the results in Postgre database.
    and also mearure the inserting time for each directory

    Args:
        pathExifTool (str): Path to the exiftool.
        directory (List): The list of scanned directories
        options (List[str]): The list of CPU options
        dbID (int): The id for current Tree Walk execution
    """
    #: Debugging variable to check how many exiftool scans fail
    failures = []

    #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
    time_list  = []
    xtime_list = []
    ytime_list = []
    etime_list = []
    
    for directory in splitComplete:
        try:
            etime_start   = timer()
            process = subprocess.Popen([f'{pathExifTool}', '-json', *directory], stdout=subprocess.PIPE)
            metadata = json.load(process.stdout)
            etime_end     = timer()
            etime_list.append(etime_end - etime_start)
    
            # Perform time measurement for each directory
            x, y, total_time = Benchmark(metadata, con, dbID).insert_file()
            
            if bool:
                for dir in directory:
                    TRACER.add_node(dir)
           
            time_list.append(total_time)
            xtime_list.append(x)
            ytime_list.append(y)
    
        except subprocess.CalledProcessError:
            failures.append(directory)
        except Exception as e: print(e)

    # Print total compute time
    if time_list[0] == None:
        pprint('####################')
        pprint('  Total time: {}'.format(sum(time_list[1::])))
        pprint('Generic time: {}'.format(sum(xtime_list[1::])))
        pprint('    eav time: {}'.format(sum(ytime_list[1::])))
        pprint('Exiftooltime: {}'.format(sum(etime_list)))
    else:
        pprint('####################')
        pprint('  Total time: {}'.format(sum(time_list)))
        pprint('Generic time: {}'.format(sum(xtime_list)))
        pprint('    eav time: {}'.format(sum(ytime_list)))
        pprint('Exiftooltime: {}'.format(sum(etime_list)))

def workSize(pathInput: str) -> List[str]:
    """Creates a hash table based on the total amount of files per directory.

    Args:
        pathInput: Path to a directory for processing.
    Returns:
        List with processed directory and the file size
    """
    root, directories, files = next(os.walk(pathInput))
    return [pathInput, len(files)]


def err(message: str) -> None:
    """Helper function to display error message and exit.

    Args:
        message (str): message to display before exiting

    """
    print(message)
    exit(1)


if __name__ == "__main__":

    start_time = time.time()

    #: Load the config files data
    with open('configCrawler.json') as jsonData:
        data = json.load(jsonData)

    #: Check for invalid input and make string of the root directories for the tree_walk table in the database
    treeWalk = ''
    if not os.path.isfile(data['paths']['exiftool']):
        err(f'ExifTool \'{data["paths"]["exiftool"]}\' does not exist.')
    for directory in data['paths']['inputs']:
        if not os.path.isdir(directory['path']):
            err(f'Input directory \'{data["paths"]["inputs"]}\' does not exist.')
        treeWalk += f'{directory["path"]}'
        if directory['recursive']:
            treeWalk += ':recursive, '
        else:
            treeWalk += ':single, '
    if not os.path.isdir(data['paths']['output']):
        err(f'Output directory \'{data["paths"]["output"]}\' does not exist.')
    treeWalk = treeWalk[:-2]

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

    #: Add all desired options to a list
    options = []
    if data['options']['language'] != 'en':
        options.append(f"-lang {data['options']['language']}")
    if len(data['options']['fileTypes']) != 0:
        for element in data['options']['fileTypes']:
            options.append('-ext')
            options.append(element)

    # FIXME
    TRACER = tracing.Tracer(data)

    #: gather the given input directories contents
    roots = []
    total_time = []
    for directory in data['paths']['inputs']:
        roots.extend(naiveCreateWorkpackages(directory['path'], directory['recursive']))
    print(roots)
    #: Attempt to create even work packages
    #: Variable representing the average work package size
    X = 250
    #: Gather a list with every directory and it's total amount of files
    directorySize = []
    for root in roots:
        directorySize.append(workSize(root))

    workPackages = []
    #: Split the workload into packages of size X
    split = []
    while 1:
        workPackageTmp = [[],0]
        for element in directorySize.copy():
            if element[1] + workPackageTmp[1] <= X:
                workPackageTmp[0].append(element[0])
                workPackageTmp[1] += element[1]
                directorySize.remove(element)
            else:
                if element[1] > X:
                    split.append([element[0]])
                    # workPackages.append([element[0]])
                    directorySize.remove(element)
                    continue
        workPackages.append(workPackageTmp[0])
        if len(directorySize) < 1:
            break

    dbConnectionPool = DatabaseConnection(data['db_info'], powerLevel)
    #: Run the tree walk in parallel
    #: Write the start of the crawler into the database
    start = f"INSERT INTO tree_walk (name, notes, root_path, created_time, status, crawl_config, save_in_gerneric_table)  VALUES('test' ,'---' ,'{treeWalk}' ,'{datetime.now()}' ,NULL ,NULL ,NULL) RETURNING id"
    dbID = dbConnectionPool.insert_new_record(start)

    # Run the small work packages
    with ThreadPoolExecutor(max_workers=powerLevel) as executor:
        for directories in workPackages:
            future = executor.submit(naiveTreeWalkUpdate, data['paths']['exiftool'], directories, options,dbConnectionPool, dbID, True)
            # future = executor.submit(naiveTreeWalkBenchmark, data['paths']['exiftool'], [directories], options, dbConnectionPool, dbID, True)

    # Run the big work packages
    splitList = lambda split, X: [split[i: i + X] for i in range(0, len(split), X)]
    with ThreadPoolExecutor(max_workers=powerLevel) as executor:
        for directories in split:
            for root, directory, files in os.walk(directories[0]):
                completePath = [root + '/' + s for s in files]
                splitComplete = splitList(completePath,X)
                for element in splitComplete:
                    future = executor.submit(naiveTreeWalkUpdate, data['paths']['exiftool'], element, options, dbConnectionPool, dbID, False)
                # future = executor.submit(naiveTreeWalkBenchmark, data['paths']['exiftool'], splitComplete, options, dbConnectionPool, dbID, False)
            print(directories)
            TRACER.add_node(directories[0])

    elapsed_time = time.time() - start_time
    pprint(f"Execution time: {elapsed_time}")
