"""Create a random directory tree with given data.

This module creates a random directory tree structure and (randomly) copies
the input data inside this tree structure.
It is used for converting a flat directory into a hierarchical directory
structure.
"""


# Python imports
import os
import string
import random
import shutil
import argparse
from typing import Dict, List, Tuple


# Constants
_STRING_MIN_LENGTH = 4
_STRING_MAX_LENGTH = 12
_RANDOM_DIR_PROB = 0.95


def _clean_up(message: str, working_directory: str = None) -> None:
    """Remove the working directory and exit.

    Args:
        message (str): message to print to console
        working_directory (str): result directory. Default is None.

    """
    if working_directory:
        try:
            shutil.rmtree(working_directory)
        except FileNotFoundError:
            pass
    print(f'Error: {message}.')


def _create_directory(root: str, name: str) -> str:
    """Wrapper for safely creating a directory

    Args:
        root (str): root directory to create the directory
        name (str): name of the directory

    Returns:
        str: absolute path of generated directory or None on error

    """
    dest = os.path.join(os.path.abspath(root), name)
    try:
        os.mkdir(dest)
    except OSError:
        return None
    return dest


def _get_dir_name(identifier: int) -> str:
    """Generate a directory name.

    The directory is of the form 'dir{identifier}'.

    Returns:
        str: directory name

    """
    return f'dir{identifier}'


def _create_random_tree(
        max_dirs: int,
        max_depth: int,
        working_directory: str
) -> Tuple[Dict[str, bool], int]:
    """Create a random empty directory tree.

    Args:
        max_dirs (int): maximum number of directories in one directory
        max_depth (int): maximum depth of directory tree
        working_directory (str): working directory

    Returns:
        Tuple[Dict[str, bool], int]:
            mapping from directory to done flag,
            number of created directories

    """
    error = (None, -1)
    num_created_dirs = 0
    mapping = {}
    queue = [(working_directory, 0)]
    while queue:
        directory, curr_depth = queue.pop()
        probability = random.random() < (_RANDOM_DIR_PROB**curr_depth)
        if curr_depth == max_depth or not probability:
            continue
        num_dirs = random.randint(0, max_dirs)
        new_directories = []
        for _ in range(num_dirs):
            name = _get_dir_name(num_created_dirs)
            new_directories.append(
                (_create_directory(directory, name), curr_depth + 1)
            )
            num_created_dirs += 1
        if None in new_directories:
            return error
        for new_directory, _ in new_directories:
            mapping[new_directory] = True
        queue += new_directories
    return (mapping, num_created_dirs)


def _get_input_files(input_directory: str) -> List[str]:
    """Get absolute file paths of input directory.

    Args:
        input_directory (str): input directory

    Returns:
        List[str]: list of absolute file paths

    """
    result = []
    for root, _, files in os.walk(input_directory):
        result += [os.path.abspath(os.path.join(root, tmp)) for tmp in files]
    return result


def random_tree(
        name: str,
        max_dirs: int,
        max_depth: int,
        max_files: int,
        input_directory: str,
        output_directory: str,
        big_directory_size: int,
        big_directory_probability: float
) -> Tuple[int, int, int]:
    """Create the random directory tree.

    Args:
        name (str): name of the output directory
        max_dirs (int): maximum number of directories in one directory
        max_depth (int): maximum depth of directory tree
        max_files (int): maximum number of files in one directory
        input_directory (str): input directory with the files
        output_directory (str): output directory
        big_directory_size (int): number of files in big directories
        big_directory_probability (float): probability of big directories

    Returns:
        Tuple[int, int, int]:
            number of created directories
            number of created big directories
            number of copied files

    """
    error = (0, 0, 0)
    num_big_dirs = 0
    num_copied_files = 0
    working_directory = _create_directory(output_directory, name)
    if working_directory is None:
        _clean_up(
            message='Failed creating working directory. Already exists',
            working_directory=working_directory
        )
        return error
    mapping, num_dirs = _create_random_tree(
        max_dirs=max_dirs,
        max_depth=max_depth,
        working_directory=working_directory
    )
    if mapping is None:
        _clean_up('Failed creating mapping', working_directory)
    files = _get_input_files(input_directory)
    while files:
        is_big_dir = random.random() < big_directory_probability
        if is_big_dir:
            num_big_dirs += 1
            size = big_directory_size
        else:
            size = random.randint(0, max_files)
        move_files = files[:size]
        del files[:size]
        try:
            dest = random.choice(
                [tmp for tmp in list(mapping.keys()) if mapping[tmp]]
            )
        except IndexError:
            print('No directory left. Ignoring left files.')
            return (num_dirs, num_big_dirs, num_copied_files)
        for move_file in move_files:
            shutil.copy2(move_file, dest)
            num_copied_files += 1
        mapping[dest] = False
    return (num_dirs, num_big_dirs, num_copied_files)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'input',
        type=str,
        help='Input directory with the files.'
    )
    parser.add_argument(
        'output',
        type=str,
        help='Output directory'
    )
    parser.add_argument(
        'name',
        type=str,
        help='Name of the final directory'
    )
    parser.add_argument(
        'max_depth',
        type=int,
        metavar='depth',
        help='Maximum depth of directory tree'
    )
    parser.add_argument(
        'big_directory_probability',
        type=float,
        metavar='big_dir_prob',
        help='Probability of creating big directories'
    )
    parser.add_argument(
        'big_directory_size',
        type=int,
        metavar='big_dir_size',
        help='number of files in big directories'
    )
    parser.add_argument(
        'max_dirs',
        type=int,
        metavar='dirs',
        help='Maximum number of directories in one directory'
    )
    parser.add_argument(
        'max_files',
        type=int,
        metavar='max_files',
        help='Maximum number of files in one directory'
    )
    args = parser.parse_args()
    num_dirs, num_big_dirs, num_copied_files = random_tree(
        name=args.name,
        max_dirs=args.max_dirs,
        max_depth=args.max_depth,
        max_files=args.max_files,
        input_directory=args.input,
        output_directory=args.output,
        big_directory_size=args.big_directory_size,
        big_directory_probability=args.big_directory_probability
    )
    print(f'* Created {num_dirs} directories in total.')
    print(
        f'* Created {num_big_dirs} big directories with each containing '
        f'{args.big_directory_size} files.'
    )
    print(f'* Copied {num_copied_files} files in total.')
