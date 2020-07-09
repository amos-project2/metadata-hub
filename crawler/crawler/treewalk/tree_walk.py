# Python imports
import os
import psutil
import random
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


def create_work_packages(
        inputs: List[Tuple[str, bool]],
        work_package_size: int,
        number_of_workers: int
) -> Tuple[List[List[str]], List[str]]:
    """Create the work packages for the worker processes.

    Args:
        inputs (List[Tuple[str, bool]]): list of input directories with
            recursive flag
        work_package_size (int): maximum number of files of each work package
        number_of_workers (int): number of workers, thus number of chunks

    Returns:
        List[List[List[str]]]: list of work packages

    """
    def combine_directories(directories: List[str]):
        for i in range(0, len(directories), work_package_size):
            yield directories[i: i+work_package_size]

    # Create list with every directory that is going to be processed
    directories = []
    for input in inputs:
        path = input.get('path')
        recursive = input.get('recursive')
        for root, subdirs, files in os.walk(path):
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
                    split.append(element[0])
                    directorySize.remove(element)
                    continue

        filesTmp = []
        for directory in workPackageTmp[0]:
            for root, subdirs, files in os.walk(directory):
                for file in files:
                    filesTmp.append(os.path.join(root,file))
                break
        workPackages.append(filesTmp)
        if len(directorySize) < 1:
            break
    result = [[] for _ in range(number_of_workers)]
    for number, package in enumerate(workPackages):
        index = number % number_of_workers
        result[index].append(package)
    indices = [(0, i) for i in range(number_of_workers)]
    for directory in split:
        files = [
            os.path.join(directory, fname)
            for fname in os.listdir(directory)
            if os.path.isfile(os.path.join(directory, fname))
        ]
        packages = split_package(files, work_package_size)
        for package in packages:
            total, index = min(indices)
            result[index].append(package)
            indices[index] = (total + len(files), index)
    return result


def split_package(lst, length):
    for index in range(0, len(lst), length):
        yield lst[index:index + length]


def get_number_of_workers(cpu_level: int) -> int:
    """Returns the number of worker processes to create based on the CPU level.

    Args:
        cpu_level (int): cpu level specified in the configuration

    Returns:
        int: number of processes to spawn

    """
    return int(cpu_level * 0.25 * psutil.cpu_count(logical=False))


def resize_work_packages(
        work_packages: List[List[str]],
        num_workers: int
) -> List[List[List[str]]]:
    """Updates the single work packages accordingly to the number of new workers.

    When a time interval for maximum resource consumption changes the number
    of maximum allowed workers, the single work packages have to be distributed
    again.

    Args:
        work_packages (List[List[str]]): single work packages
        num_workers (int): new number of workers

    """
    new_work_packages = [[] for _ in range(num_workers)]
    index = 0
    while work_packages:
        package = work_packages.pop()
        new_work_packages[index].append(package)
        index = (index + 1) % num_workers
    return new_work_packages
