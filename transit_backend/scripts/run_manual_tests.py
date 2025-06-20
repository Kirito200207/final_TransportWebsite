#!/usr/bin/env python
"""
Manual Test Runner

This script manually runs tests without using Django's test runner.
"""

import os
import sys
import unittest
import importlib
import traceback

# Add project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transit_backend.settings")

def run_tests():
    """Run tests manually"""
    try:
        print("Running manual tests...")
        
        # Create a test suite
        suite = unittest.TestSuite()
        
        # Add a simple test
        class SimpleTest(unittest.TestCase):
            def test_basic_addition(self):
                """Tests that 1 + 1 = 2."""
                print("Running basic addition test...")
                self.assertEqual(1 + 1, 2)
                print("Basic addition test passed!")
        
        suite.addTest(unittest.makeSuite(SimpleTest))
        
        # Run the tests
        print("Starting test runner...")
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        print(f"Tests complete. Failures: {len(result.failures)}, Errors: {len(result.errors)}")
        
        return len(result.failures) + len(result.errors)
    except Exception as e:
        print(f"Error running tests: {e}")
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    print("Script started...")
    exit_code = run_tests()
    print(f"Exiting with code {exit_code}")
    sys.exit(exit_code) 