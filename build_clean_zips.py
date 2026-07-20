import zipfile
import os
import json
import shutil

def create_zip_with_unix_paths(zip_filename, source_dir):
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                # Force Unix forward slash
                arcname = rel_path.replace(os.path.sep, '/').replace('\\', '/')
                zf.write(full_path, arcname)
    print(f'Successfully created {zip_filename} with clean Unix paths!')

# 1. Build Frontend zip
if os.path.exists('temp_fe'):
    shutil.rmtree('temp_fe')
os.makedirs('temp_fe', exist_ok=True)
shutil.copytree('frontend/dist', 'temp_fe/dist')
shutil.copy('frontend/server.js', 'temp_fe/server.js')

fe_pkg = {
    'name': 'sarathi-ai-frontend',
    'version': '1.0.0',
    'type': 'module',
    'scripts': {'start': 'node server.js'},
    'dependencies': {'express': '4.21.2'}
}
with open('temp_fe/package.json', 'w', encoding='utf-8') as f:
    json.dump(fe_pkg, f, indent=2)

create_zip_with_unix_paths('sarathi-frontend-deploy-v4-unix.zip', 'temp_fe')
create_zip_with_unix_paths('sarathi-frontend-deploy-v5-unix.zip', 'temp_fe')
shutil.rmtree('temp_fe')

# 2. Build Backend zip
if os.path.exists('temp_be'):
    shutil.rmtree('temp_be')
os.makedirs('temp_be', exist_ok=True)
shutil.copytree('backend/src', 'temp_be/src')
shutil.copy('backend/.node-version', 'temp_be/.node-version')
shutil.copy('backend/Procfile', 'temp_be/Procfile')
shutil.copy('backend/package.json', 'temp_be/package.json')

create_zip_with_unix_paths('sarathi-eb-deploy-v16-unix.zip', 'temp_be')
create_zip_with_unix_paths('sarathi-eb-deploy-v17-unix.zip', 'temp_be')
shutil.rmtree('temp_be')
print('All deployment zips created successfully!')
