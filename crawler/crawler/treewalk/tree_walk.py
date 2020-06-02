# Python imports
import os
import psutil
from typing import List, Tuple

def workSize(pathInput: str) -> List[str]:
    """Creates a hash table based on the total amount of files per directory.

    Args:
        pathInput: Path to a directory for processing.
    Returns:
        List with processed directory and the file size
    """
    root, directories, files = next(os.walk(pathInput))
    return [pathInput, len(files)]

# FIXME: This is just a dummy implementation for testing purposes.
# The interface should stay the same though
def create_work_packages(
        inputs: List[Tuple[str, bool]],
        work_package_size: int,
        number_of_workers: int,
        already_processed: List[str] = []
) -> Tuple[List[List[str]], List[str]]:
    """Create the work packages for the worker processes.

    Args:
        inputs (List[Tuple[str, bool]]): list of input directories with
            recursive flag
        work_package_size (int): maximum number of files of each work package
        number_of_workers (int): number of workers, thus number of chunks
        already_processed (List[str]): list of already processed directories

    Returns:
        Tuple[List[List[str]], List[str]]: (list of workpackages with directories < X, list of workpackages >X)

    """
    def combine_directories(directories: List[str]):
        for i in range(0, len(directories), work_package_size):
            yield directories[i: i+work_package_size]

    # Create list with every directory that is going to be processed
    print(f'Initialized tree walk with {len(already_processed)} already processed nodes.')
    directories = []
    for input in inputs:
        path = input.get('path')
        recursive = input.get('recursive')
        for root, subdirs, files in os.walk(path):
            if root in already_processed:
                if recursive == 0:
                    break
                continue
            if len(files) == 0:
                continue
            directories.append(root)
            if recursive == 0:
                break

    # Attempt to create even work packages
    # Variable representing the average work package size
    X = work_package_size
    # Gather a list with every directory and it's total amount of files
    directorySize = []
    for root in directories:
        directorySize.append(workSize(root))

    workPackages = []
    # Split the workload into packages of size X add directories > X to list split
    split = []
    while 1:
        workPackageTmp = [[], 0]
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

    result = [[] for _ in range(number_of_workers)]
    for number, package in enumerate(workPackages):
        index = number % number_of_workers
        result[index].append(package)
    split1 = [[] for _ in range(number_of_workers)]
    for number, package in enumerate(split):
        index = number % number_of_workers
        split1[index].append(package)
    return result, split1

def get_number_of_workers(power_level: int):
    return int(power_level * 0.25 * psutil.cpu_count(logical=False))
