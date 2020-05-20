"""Testsuite for unittests.

This module is used as a test suite and runs all unit tests.
"""


# Python imports
import unittest
from sys import exit


# Local imports
import tests.api as api


tests = unittest.TestSuite()
tests.addTest(unittest.makeSuite(api.Parsing))
runner = unittest.TextTestRunner(verbosity=3)
result = runner.run(tests)
if result.wasSuccessful():
    exit(0)
else:
    exit(1)
