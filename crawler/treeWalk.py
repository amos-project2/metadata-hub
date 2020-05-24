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
import crawler.services.tracing as tracing
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
    return directoryList, traceFile


def naiveTreeWalk(pathExifTool: str, pathProtocol: str, directory:str, options:List[str]) -> None:
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
            subprocess.check_call([f'{pathExifTool}', '-json', *options, directory], stdout=myFile)
            TRACER.add_node(directory)
    except subprocess.CalledProcessError:
        failures.append(directory)


def naiveTreeWalkUpdate(pathExifTool: str, directory:str, options:List[str], con:DatabaseConnection, dbID:int) -> None:
    """Naive implementation of the tree walk. inserts the results in Postgre database.

    Args:
        pathExifTool (str): Path to the exiftool.
        pathProtocol (str): Path to the output directory
        directory (str): The directory to scan
        traceFile (str): The trace file
    """
    #: Debugging variable to check how many exiftool scans fail
    failures = []

    #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
    try:
        process  = subprocess.Popen([f'{pathExifTool}', '-json', directory], stdout=subprocess.PIPE)
        metadata = json.load(process.stdout)
        # Walk through each object/file
        for file_number in metadata:
            # Create query and insert into 1 table_generic from 1 file
            genericID = con.insert_new_record(extractData(file_number).extract_metadata_generic(dbID))
            
            # Create queries and insert into 1 table_eav from 1 file
            query = extractData(file_number).extract_metadata_eav(dbID, genericID)
            # Apply each query to insert for each row
            for query_number in query:
                con.insert_new_record(query_number)
        TRACER.add_node(directory)
    except subprocess.CalledProcessError:
        failures.append(directory)
    except Exception as e: print(e)


def naiveTreeWalkBenchmark(pathExifTool: str, package: list, options:List[str], con:DatabaseConnection, dbID:int) -> None:
    """Naive implementation of the tree walk. inserts the results in Postgre database.
    and also mearure the inserting time for each directory

    Args:
        pathExifTool (str): Path to the exiftool.
        package (List): The list of scanned directories
        options (List[str]): The list of CPU options
        dbID (int): The id for current Tree Walk execution
    """
    #: Debugging variable to check how many exiftool scans fail
    failures = []

    #: Walk over every directory and execute the exiftool. Log to file to <pathProtocol>
    time_list  = []
    xtime_list = []
    ytime_list = []

    for directory in package:
        try:     
            process  = subprocess.Popen([f'{pathExifTool}', '-json', directory], stdout=subprocess.PIPE)
            metadata = json.load(process.stdout)
            
            # Perform time measurement for each directory
            x, y, total_time = Benchmark(metadata, con, dbID).insert_file()
            TRACER.add_node(directory)
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
        pprint(time_list[1::])
    else:
        pprint('####################')
        pprint('  Total time: {}'.format(sum(time_list)))
        pprint('Generic time: {}'.format(sum(xtime_list)))
        pprint('    eav time: {}'.format(sum(ytime_list)))
        pprint(time_list)
        

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

    #: Check for invalid input and make string of the root directories for the tree_walk table in the database
    treeWalk = ''
    if not os.path.isfile(data['paths']['exiftool']):
        err(f'ExifTool \'{data["paths"]["exiftool"]}\' does not exist.')
    for directory in data['paths']['inputs']:
        if not os.path.isdir(directory['path']):
            err(f'Input directory \'{data["paths"]["inputPath"]}\' does not exist.')
        treeWalk += f'{directory["path"]}'
        if directory['recursive']:
            treeWalk += ':recursive, '
        else:
            treeWalk += ':single, '
    if not os.path.isdir(data['paths']['output']):
        err(f'Output directory \'{data["paths"]["outputPath"]}\' does not exist.')
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
        roots.append(naiveCreateWorkpackages(directory['path'], directory['recursive']))

    #: Run the tree walk in parallel
    #: Write the start of the crawler into the database
    dbConnection = DatabaseConnection(data['db_info'])
    start = f"INSERT INTO tree_walk (name, notes, root_path, created_time, status, crawl_config, save_in_gerneric_table)  VALUES('test' ,'---' ,'{treeWalk}' ,'{datetime.now()}' ,NULL ,NULL ,NULL) RETURNING id"
    dbID = dbConnection.insert_new_record(start)
    for package in roots:
        with ThreadPoolExecutor(max_workers=powerLevel) as executor:
#            for directory in package[0]:
#                future = executor.submit(naiveTreeWalkUpdate, data['paths']['exiftool'], directory, options,  dbConnection, dbID)
                future =  executor.submit(naiveTreeWalkBenchmark, data['paths']['exiftool'], package[0], options,  dbConnection, dbID)
