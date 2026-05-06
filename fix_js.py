import re
import sys

def fix_js(content, filename):
    # Replace const/let with var
    content = re.sub(r'\bconst\b', 'var', content)
    content = re.sub(r'\blet\b', 'var', content)
    
    # Replace arrow functions: (args) => { body } or arg => expr
    # Pattern 1: function calls with arrow functions as arguments
    # e.g., .forEach(key => { ... })
    # We need to be careful with this - let's do a simpler approach
    
    # Replace template literals: `text ${expr}` -> 'text ' + (expr)
    # This is complex, let's handle simple cases
    def replace_template(m):
        s = m.group(0)
        # Remove backticks
        inner = s[1:-1]
        # Replace ${...} with ' + (...) + '
        inner = re.sub(r'\$\{([^}]+)\}', r"' + (\1) + '", inner)
        # Handle the + '' at boundaries
        result = "'" + inner + "'"
        result = result.replace("' + '' + '", '')
        result = result.replace("'' + '", "'")
        result = result.replace("' + ''", "")
        return result
    
    # Only replace template literals that don't contain nested backticks
    content = re.sub(r'`[^`]*`', replace_template, content)
    
    # Replace arrow functions in forEach, map, filter, etc.
    # Pattern: .forEach(function(args) { ... }) but with => 
    # This is too complex for simple regex, let's use a line-by-line approach
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for arrow functions and convert them
        # Pattern: arg => expr or (args) => { body }
        # Simple cases first
        
        # Replace: .forEach(key => {  ->  .forEach(function(key) {
        line = re.sub(r'\.forEach\(\s*([^=]+)\s*=>\s*\{', r'.forEach(function(\1) {', line)
        line = re.sub(r'\.map\(\s*([^=]+)\s*=>\s*\{', r'.map(function(\1) {', line)
        line = re.sub(r'\.filter\(\s*([^=]+)\s*=>\s*\{', r'.filter(function(\1) {', line)
        line = re.sub(r'\.reduce\(\s*\(([^,]+),\s*([^)]+)\)\s*=>', r'.reduce(function(\1, \2)', line)
        line = re.sub(r'\.some\(\s*([^=]+)\s*=>\s*\{', r'.some(function(\1) {', line)
        line = re.sub(r'\.every\(\s*([^=]+)\s*=>\s*\{', r'.every(function(\1) {', line)
        
        # Replace simple arrow functions: () => expr
        line = re.sub(r'\(\s*\)\s*=>\s*(\{[^}]*\})', r'function() \1', line)
        
        # Replace event listener arrows: , () => { ... }
        line = re.sub(r',\s*\(\)\s*=>\s*\{', r', function() {', line)
        line = re.sub(r',\s*([^=]+)\s*=>\s*\{', r', function(\1) {', line)
        
        # Replace standalone arrows at end of lines
        # e.g., .then(data => { ... })
        line = re.sub(r'=>\s*\{', 'function() {', line)
        
        new_lines.append(line)
        i += 1
    
    return '\n'.join(new_lines)

# Process all JS files
import os
js_files = ['js/practice.js', 'js/features.js', 'js/audio.js', 'js/app.js']

for f in js_files:
    if not os.path.exists(f):
        print(f"Skipping {f} - not found")
        continue
    print(f"Processing {f}...")
    with open(f, 'r') as fh:
        content = fh.read()
    
    fixed = fix_js(content, f)
    
    with open(f, 'w') as fh:
        fh.write(fixed)
    
    print(f"  Fixed {f}")

print("Done!")
