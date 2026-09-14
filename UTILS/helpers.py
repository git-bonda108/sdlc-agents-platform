
import os
import json
import yaml
from typing import Any, Dict, List, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from JSON or YAML file"""
    try:
        with open(config_path, 'r') as f:
            if config_path.endswith('.json'):
                return json.load(f)
            elif config_path.endswith(('.yml', '.yaml')):
                return yaml.safe_load(f)
            else:
                raise ValueError("Unsupported config file format")
    except Exception as e:
        logger.error(f"Error loading config from {config_path}: {e}")
        return {}

def save_config(config: Dict[str, Any], config_path: str) -> bool:
    """Save configuration to JSON or YAML file"""
    try:
        with open(config_path, 'w') as f:
            if config_path.endswith('.json'):
                json.dump(config, f, indent=2)
            elif config_path.endswith(('.yml', '.yaml')):
                yaml.dump(config, f, default_flow_style=False)
            else:
                raise ValueError("Unsupported config file format")
        return True
    except Exception as e:
        logger.error(f"Error saving config to {config_path}: {e}")
        return False

def ensure_directory(directory_path: str) -> bool:
    """Ensure directory exists, create if it doesn't"""
    try:
        os.makedirs(directory_path, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Error creating directory {directory_path}: {e}")
        return False

def get_file_extension(file_path: str) -> str:
    """Get file extension from file path"""
    return os.path.splitext(file_path)[1].lower()

def is_python_file(file_path: str) -> bool:
    """Check if file is a Python file"""
    return get_file_extension(file_path) == '.py'

def is_config_file(file_path: str) -> bool:
    """Check if file is a configuration file"""
    config_extensions = ['.json', '.yaml', '.yml', '.toml', '.ini', '.env']
    return get_file_extension(file_path) in config_extensions

def is_documentation_file(file_path: str) -> bool:
    """Check if file is a documentation file"""
    doc_extensions = ['.md', '.rst', '.txt']
    return get_file_extension(file_path) in doc_extensions

def get_timestamp() -> str:
    """Get current timestamp as string"""
    return datetime.now().isoformat()

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f}{size_names[i]}"

def validate_python_syntax(file_path: str) -> bool:
    """Validate Python file syntax"""
    try:
        with open(file_path, 'r') as f:
            compile(f.read(), file_path, 'exec')
        return True
    except SyntaxError as e:
        logger.error(f"Syntax error in {file_path}: {e}")
        return False
    except Exception as e:
        logger.error(f"Error validating {file_path}: {e}")
        return False

def extract_imports(file_path: str) -> List[str]:
    """Extract import statements from Python file"""
    imports = []
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('import ') or line.startswith('from '):
                    imports.append(line)
    except Exception as e:
        logger.error(f"Error extracting imports from {file_path}: {e}")
    
    return imports

def create_file_inventory(directory: str) -> List[Dict[str, Any]]:
    """Create inventory of files in directory"""
    inventory = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                stat = os.stat(file_path)
                inventory.append({
                    'path': file_path,
                    'name': file,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'extension': get_file_extension(file),
                    'is_python': is_python_file(file),
                    'is_config': is_config_file(file),
                    'is_documentation': is_documentation_file(file)
                })
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {e}")
    
    return inventory

class FileValidator:
    """Validate files in the SDLC system"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_python_files(self, directory: str) -> Dict[str, Any]:
        """Validate all Python files in directory"""
        results = {
            'total_files': 0,
            'valid_files': 0,
            'invalid_files': 0,
            'errors': []
        }
        
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    results['total_files'] += 1
                    
                    if validate_python_syntax(file_path):
                        results['valid_files'] += 1
                    else:
                        results['invalid_files'] += 1
                        results['errors'].append(file_path)
        
        return results
    
    def validate_config_files(self, directory: str) -> Dict[str, Any]:
        """Validate configuration files"""
        results = {
            'total_files': 0,
            'valid_files': 0,
            'invalid_files': 0,
            'errors': []
        }
        
        for root, dirs, files in os.walk(directory):
            for file in files:
                if is_config_file(file):
                    file_path = os.path.join(root, file)
                    results['total_files'] += 1
                    
                    try:
                        load_config(file_path)
                        results['valid_files'] += 1
                    except Exception as e:
                        results['invalid_files'] += 1
                        results['errors'].append(f"{file_path}: {str(e)}")
        
        return results

# Example usage
if __name__ == "__main__":
    # Create file inventory
    inventory = create_file_inventory(".")
    print(f"Found {len(inventory)} files")
    
    # Validate Python files
    validator = FileValidator()
    python_results = validator.validate_python_files(".")
    print(f"Python validation: {python_results}")
