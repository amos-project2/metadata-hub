# Python imports
import os
import psutil
from typing import List, Tuple


# FIXME: This is just a dummy implementation for testing purposes.
# The interface should stay the same though
def create_work_packages(
        inputs: List[Tuple[str, bool]],
        work_package_size: int,
        number_of_workers: int,
        already_processed: List[str] = []
) -> List[List[str]]:
    """Create the work packages for the worker processes.

    Args:
        inputs (List[Tuple[str, bool]]): list of input directories with
            recursive flag
        work_package_size (int): maximum number of files of each work package
        number_of_workers (int): number of workers, thus number of chunks
        already_processed (List[str]): list of already processed directories

    Returns:
        List[List[str]]: list of workpackages

    """

    def combine_directories(directories: List[str]):
        for i in range(0, len(directories), work_package_size):
            yield directories[i: i+work_package_size]

    directories = []
    for entry in inputs:
        path = entry.get('path')
        recursive = entry.get('recursive')
        for root, subdirs, files in os.walk(path):
            if root in already_processed and not recursive:
                break
            directories.append(root)
            if not recursive:
                break
    packages = list(combine_directories(directories))
    result = [[] for _ in range(number_of_workers)]
    for number, package in enumerate(packages):
        index = number % number_of_workers
        result[index].append(package)
    return result


def get_number_of_workers(power_level: int):
    return int(power_level * 0.25 * psutil.cpu_count(logical=False))
