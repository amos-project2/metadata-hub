
import json
from typing import Dict, Tuple

def create_metadata_increase(exif_output: json) -> Dict:
    """Creates an easy to process dictionary for updating the 'metadata' table in the database

    Args:
        exif_output (json): The output from the ExifTool output.
    Returns:
        Dict: key: file type | value: Dict: key: tag value: count
    """
    # Loop over every tag for each file in the ExifTool output and add them to the dictionary
    tag_values = {}
    for single_output in exif_output:
        fileType = single_output['FileType']
        if fileType not in tag_values:
            tag_values[fileType] = {}
        for tag_value in single_output:
            test = dict(single_output)
            if tag_value in tag_values[fileType]:
                tag_values[fileType][tag_value][0] += 1
            else:
                tag_values[fileType][tag_value] = [1, '?']
            if tag_values[fileType][tag_value][1] == '?':
                tag_values[fileType][tag_value][1] = output_type(test[tag_value])
    return tag_values

def create_metadata_decrease(exif_output: json) -> Dict:
    """Creates an easy to process dictionary for updating the 'metadata' table in the database

    Args:
        exif_output (json): The output from the ExifTool output.
    Returns:
        Dict: key: file type | value: Dict: key: tag value: count
    """
    # Loop over every tag for each file in the ExifTool output and add them to the dictionary
    tag_values = {}
    for single_output in exif_output:
        fileType = single_output['FileType']
        if fileType not in tag_values:
            tag_values[fileType] = {}
        for tag_value in single_output:
            test = dict(single_output)
            if tag_value in tag_values[fileType]:
                tag_values[fileType][tag_value][0] -= 1
            else:
                tag_values[fileType][tag_value] = [-1, '?']
            if tag_values[fileType][tag_value][1] == '?':
                tag_values[fileType][tag_value][1] = output_type(test[tag_value])
    return tag_values

def output_type(to_check: str):
    """Determine whether the output value of a file is a digit or a string
    Args:
        to_check (str): The string variant of the value
    Returns:
        float representation if conversion is possible, string otherwise
    """
    try:
        checked = float(to_check)
        return 'dig'
    except:
        return 'str'


def create_insert(crawl_id: int, exif: json) -> Tuple[str]:
    """Helper method for collecting all the values from the output of a file.

    Args:
        exif (json): the exif output
        value (str): the fist part of the string

    Returns:
        str: string with the extracted values

    """
    # Make validity check (if any of these are missing, the element can't be inserted into the database)
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
        # TODO better fix than dumping the json in the worker (after extracting the single file tags)
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
