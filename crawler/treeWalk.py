#TODO Add logging of already passed directories
#TODO Add debugging logging
#TODO Add CPU-Check
#TODO Add Multi Thread

import os
import subprocess

def naiveTreeWalk(pathExifTool, pathInput, pathProtocol):
    """Naive implementation of the tree walk. logs the results in Json format.

    Args:
        pathExifTool: Path to the exiftool.
        pathInput: Path to the directory we want to walk.
        pathProtocol

    Returns:
        None

    """

    #: Debugging variable to check how many exiftool scans fail
    failures = []

    #: Walk over every directory and execute the exiftool. Log to file protocol.txt at <pathProtocol>
    with open(f'{pathProtocol}/protocol.txt', 'w') as myFile:
        for root, directories, files in os.walk(pathInput):
            try:
                subprocess.check_call([f'{pathExifTool}', '-json', root], stdout=myFile)
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
# pathProtocol = '/home/thomas/Documents/master/amos/metadata-hub/crawler/protocol'
# #: for testing purposes
# naiveTreeWalk(pathExifTool, pathInput, pathProtocol)
# dictionary = hashTable(pathInput)
# for entry in dictionary:
#     print(f'{entry}:  {dictionary[entry]}')
