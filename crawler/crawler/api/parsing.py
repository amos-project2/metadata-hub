"""Parsing of the form data of the web interface for configuration"""


# Python imports
from typing import Dict, Any, List, Union, Tuple


#: Required keys of the form data
REQUIRED_PROPERTIES = [
    'inputs',
    'output',
    'trace',
    'exiftool',
    'powerLevel',
    'clearTrace',
    'fileTypes',
    'language',
    'packageSize',
    'update'
]


class APIParsingException(Exception):
    """Raise if parsing of the form data fails"""
    pass


def _check_input_type(user_input: Any) -> bool:
    """Helper method to check if type of argument is string.

    Args:
        user_input (Any): input by user

    Returns:
        bool: True if input type is string, False otherwise

    """
    return isinstance(user_input, str)


def _parse_inputs(inputs: str) -> List[Dict[str, Union[str, bool]]]:
    """Parse the input directories.

    Args:
        inputs (str): string specifing the input directories and recursive option

    Returns:
        List[Dict[str, Union[str, bool]]]: list according to schema, None on error

    """
    if not _check_input_type(inputs):
        return None
    try:
        entries = [
            tuple(entry.split(","))
            for entry in inputs.split(';')
        ]
        result = []
        for path, recursive in entries:
            recursive = recursive.strip().lower()
            if recursive == 'true':
                value = True
            elif recursive == 'false':
                value = False
            else:
                return None
            result.append({
                'path': path.strip(),
                'recursive': value
            })
        return result
    except ValueError:
        return None


def _parse_output(output: str) -> str:
    """Parse the output directory

    Args:
        output (str): output input

    Returns:
        str: input or None on error

    """
    if not _check_input_type(output):
        return None
    return output


def _parse_trace(trace: str) -> str:
    """Parse the trace file.

    Args:
        trace (str): trace file input

    Returns:
        str: input or None on error

    """
    if not _check_input_type(trace):
        return None
    return trace


def _parse_exiftool(exiftool: str) -> str:
    """Parse the exiftool path.

    Args:
        exiftool (str): exiftool input

    Returns:
        str: given value if it is of type string, None otherwise

    """
    if not _check_input_type(exiftool):
        return None
    return exiftool


def _parse_clear(clear_trace: str) -> bool:
    """Parse the clear flag for trace data.

    Args:
        clear_trace (str): clear trace data input

    Returns:
        bool: True/False or None on error

    """
    if clear_trace == 'true':
        return True
    if clear_trace == 'false':
        return False
    return None


def _parse_power(power_level: str) -> int:
    """Parse the power level.

    Args:
        power_level (str): power level input

    Returns:
        int: power level as int or None on error

    """
    if not _check_input_type(power_level):
        return None
    try:
        return int(power_level)
    except ValueError:
        return None


def _parse_filetypes(file_types: str) -> List[str]:
    """Parse the desired filetypes

    If all filetypes are desired, the function returns ['all']

    Args:
        file_types (str): desired filetypes

    Returns:
        List[str]: list of filetypes or None on error

    """
    if not _check_input_type(file_types):
        return None
    file_types = file_types.split(',')
    if 'all' in file_types:
        return ['all']
    # Get rid of any empty or only whitespace containing element
    return ' '.join(file_types).split()


def _parse_language(language: str) -> str:
    """Parse the desired output language.

    Args:
        language (str): given language

    Returns:
        str: one of the supported languages or None on error

    """
    if not _check_input_type(language):
        return None
    return language


def _parse_package_size(package_size: str) -> int:
    """Parse the size of the work packages.

    Only allow positive numbers for package size. Do not make any other
    restrictions for now.

    Args:
        package_size (str): size of work packages to process

    Returns:
        int: size of the work packages or None on error

    """
    if not _check_input_type(package_size):
        return None
    try:
        return int(package_size)
    except ValueError:
        return None


def _parse_update(update: str) -> bool:
    """Parse the update flag for TreeWalk execution.

    Args:
        update (str): update current execution

    Returns:
        bool: True/False or None on error

    """
    if update == 'true':
        return True
    if update == 'false':
        return False
    return None


def parse(form_data: dict) -> Tuple[dict, bool]:
    """Parse the form data given by user.

    Args:
        form_data (dict): [description]

    Raises:
        APIParsingException: if parsing of any component fails

    Returns:
        Tuple[dict, bool]:
            dictionary according to the configuration schema
            stop and start possible current execution or ignore config

    """
    for prop in REQUIRED_PROPERTIES:
        if prop not in form_data:
            raise APIParsingException('Form data was modified.')
    inputs = _parse_inputs(form_data.get('inputs'))
    if inputs is None:
        raise APIParsingException('Invalid input field: Input directories')
    output = _parse_output(form_data.get('output'))
    if output is None:
        raise APIParsingException('Invalid input field: Output directory')
    trace = _parse_trace(form_data.get('trace'))
    if trace is None:
        raise APIParsingException('Invalid input field: Trace file')
    exiftool = _parse_exiftool(form_data.get('exiftool'))
    if exiftool is None:
        raise APIParsingException('Invalid input field: ExifTool')
    clear_trace = _parse_clear(form_data.get('clearTrace'))
    if clear_trace is None:
        raise APIParsingException('Invalid input field: Clear trace data')
    power_level = _parse_power(form_data.get('powerLevel'))
    if power_level is None:
        raise APIParsingException('Invalid input field: Power Level')
    file_types = _parse_filetypes(form_data.get('fileTypes'))
    if file_types is None:
        raise APIParsingException('Invalid input field: Filetypes')
    language = _parse_language(form_data.get('language'))
    if language is None:
        raise APIParsingException('Invalid input field: Language')
    package_size = _parse_package_size(form_data.get('packageSize'))
    if package_size is None:
        raise APIParsingException('Invalid input field: Package size')
    update = _parse_update(form_data.get('update', '').lower())
    if update is None:
        raise APIParsingException('Invalid input field: Update')
    result = {
        'paths': {
            'inputs': inputs,
            'output': output,
            'trace': trace,
            'exiftool': exiftool
        },
        'options': {
            'clearTrace': clear_trace,
            'powerLevel': power_level,
            'fileTypes': file_types,
            'language': language,
            'packageSize': package_size
        }
    }
    return (result, update)
