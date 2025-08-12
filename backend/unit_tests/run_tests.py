#!/usr/bin/env python3
"""
Test runner script for Lease Buddy backend unit tests
"""

import unittest
import sys
import os
import subprocess

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_all_tests():
    """Run all unit tests"""
    print("=" * 60)
    print("Running Lease Buddy Backend Unit Tests")
    print("=" * 60)
    
    # Get the directory containing the test files
    test_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Discover and run all tests
    loader = unittest.TestLoader()
    suite = loader.discover(test_dir, pattern='test_*.py')
    
    # Create a test runner
    runner = unittest.TextTestRunner(verbosity=2)
    
    # Run the tests
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped) if hasattr(result, 'skipped') else 0}")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

def run_specific_test(test_file):
    """Run a specific test file"""
    print(f"Running test file: {test_file}")
    
    # Import and run the specific test
    test_module = __import__(test_file.replace('.py', ''))
    
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(test_module)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return 0 if result.wasSuccessful() else 1

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'unittest',
        'sys',
        'os',
        'json',
        'requests',
        'fastapi',
        'pydantic',
        'openai',
        'dotenv'
    ]
    
    # Optional packages that might not be available
    optional_packages = [
        'spacy',
        'torch',
        'transformers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    # Check optional packages but don't fail if missing
    for package in optional_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            print(f"Warning: Optional package '{package}' not available. Some tests may be skipped.")
    
    if missing_packages:
        print("Missing required packages:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nPlease install missing packages using:")
        print("pip install " + " ".join(missing_packages))
        return False
    
    return True

def main():
    """Main function"""
    print("Checking dependencies...")
    if not check_dependencies():
        return 1
    
    # Check command line arguments
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        if not test_file.endswith('.py'):
            test_file += '.py'
        return run_specific_test(test_file)
    else:
        return run_all_tests()

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code) 