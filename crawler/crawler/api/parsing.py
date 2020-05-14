"""Parsing of the form data of the web interface for configuration"""


# Python imports
from typing import Dict, Any, List, Union


#: Required keys of the form data
REQUIRED_PROPERTIES = [
    'inputs',
    'output',
    'trace',
    'exiftool',
    'power',
    'clear'
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
        str: linux or windows, None on error

    """
    if exiftool in ['linux', 'windows']:
        return exiftool
    return None


def _parse_clear(clear: str) -> bool:
    """Parse the clear flag for trace data.

    Args:
        clear (str): clear trace data input

    Returns:
        bool: True/False or None on error

    """
    if clear == 'true':
        return True
    if clear == 'false':
        return False
    return None


def _parse_power(power: str) -> int:
    """Parse the power level.

    Args:
        power (str): power level input

    Returns:
        int: power level as int or None on error
    """
    if not _check_input_type(power):
        return None
    if power in ['1', '2', '3', '4']:
        return int(power)
    return None



def parse(form_data: dict) -> dict:
    """Parse the form data given by user.

    Args:
        form_data (dict): [description]

    Raises:
        APIParsingException: if parsing of any component fails

    Returns:
        dict: dictionary according to the configuratio schema

    """

    for prop in REQUIRED_PROPERTIES:
        print(prop)
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
    clear = _parse_clear(form_data.get('clear'))
    if clear is None:
        raise APIParsingException('Invalid input field: Clear trace data')
    power = _parse_power(form_data.get('power'))
    if power is None:
        raise APIParsingException('Invalid input field: Power Level')
    result = {
        'inputs': inputs,
        'output': output,
        'trace': trace,
        'exiftool': exiftool,
        'options': {
            'clearTrace': clear,
            'powerLevel': power
        }
    }
    return result
