"""Utility functions for the TWWorker."""


# Python imports
import json
from typing import Tuple


def create_insert(crawl_id: int, exif: dict) -> Tuple[str]:
    """Helper method for collecting all the values from the output of a file.

    Args:
        exif (dict): the exif output
        value (str): the fist part of the string

    Returns:
        str: string with the extracted values

    """
    # Make validity check:
    # if any of these are missing, the element can't be inserted into the DB
    for element in ['Directory', 'FileName']:
        if element not in exif:
            return (0,)

    # Create tuple for values
    insert_values = (crawl_id,)

    # Extract the metadata for the 'files' table
    for i in ['Directory', 'FileName', 'FileType']:
        try:
            insert_values += (exif[i],)
        except:
            insert_values += ('NULL',)
    for i in ['FileSize']:
        try:
            val = exif[i]
            insert_values += (val,)
        except:
            insert_values += (None,)
    try:
        # TODO better fix than dumping the json in the worker
        # (after extracting the single file tags)
        insert_values += (json.dumps(exif),)
    except:
        insert_values += ('NULL',)
    for i in ['FileAccessDate', 'FileModifyDate', 'FileCreationDate']:
        try:
            valueTmp = f'{exif[i]}'
            valueFormat = valueTmp[:12].replace(':', '-') + valueTmp[13:]
            if valueFormat == '0000-00-00 0:00:00':
                insert_values += ('-infinity',)
            else:
                insert_values += (valueFormat,)
        except:
            insert_values += ('-infinity',)
    insert_values += (False, '-infinity')
    return insert_values


def create_metadata(exif_output: dict, increase: bool) -> dict:
    """Creates an easy to process dictionary for updating the 'metadata' table.

    Loops over every tag for each file in the ExifTool output and add them to
    the dictionary. According to in-/decrease, counts are in-/decreased.

    Args:
        exif_output (json): the output from the ExifTool
        increase (bool): increase or decrease values

    Returns:
        dict: key: file type | value: Dict: key: tag value: count

    """
    udpate_value = 1 if increase else -1
    tag_values = {}
    for single_output in exif_output:
        fileType = single_output['FileType']
        if fileType not in tag_values:
            tag_values[fileType] = {}
        for tag_value in single_output:
            test = dict(single_output)
            if tag_value in tag_values[fileType]:
                tag_values[fileType][tag_value][0] += udpate_value
            else:
                tag_values[fileType][tag_value] = [udpate_value, '?']
            if tag_values[fileType][tag_value][1] == '?':
                tag_values[fileType][tag_value][1] = output_type(test[tag_value])
    return tag_values


def output_type(to_check: str) -> str:
    """Determine whether the output value of a file is a digit or a string.

    Args:
        to_check (str): The string variant of the value

    Returns:
        str: 'dig' if parsing to float succeeded, 'str' otherwise

    """
    try:
        checked = float(to_check)
        return 'dig'
    except:
        return 'str'
