#!/usr/bin/env python3
import os
import re
import glob

def add_auth_check(content):
    """Agrega el chequeo de autorización después de requireAuthAPI()"""
    
    # Patrón para encontrar las llamadas a requireAuthAPI
    pattern = r'(const session = await requireAuthAPI\(\))'
    
    # Chequeo a insertar
    auth_check = """
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }"""
    
    # Si ya tiene el chequeo, no hacer nada
    if 'if (!session)' in content:
        return content
    
    # Reemplazar agregando el chequeo
    modified = re.sub(pattern, r'\1' + auth_check, content)
    
    return modified

# Buscar todos los archivos route.ts en app/api
api_files = glob.glob('/Users/ja/v4/bmad-nextjs-app/app/api/**/route.ts', recursive=True)

processed = 0
skipped = 0

for file_path in api_files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Solo procesar si tiene requireAuthAPI
        if 'requireAuthAPI()' in content:
            modified_content = add_auth_check(content)
            
            if modified_content != content:
                with open(file_path, 'w') as f:
                    f.write(modified_content)
                print(f"✅ Arreglado: {os.path.basename(os.path.dirname(file_path))}/route.ts")
                processed += 1
            else:
                skipped += 1
    except Exception as e:
        print(f"❌ Error procesando {file_path}: {e}")

print(f"\n📊 Resumen: {processed} archivos arreglados, {skipped} ya estaban bien")