"""Shared training/browser input contract and patient-separated data validation."""
from pathlib import Path
import csv
import hashlib
import numpy as np
from PIL import Image, ImageOps
CLASSES = ['glioma', 'meningioma', 'pituitary', 'no_tumour']


def preprocess(image):
    image = ImageOps.exif_transpose(image).convert('RGBA')
    if image.width * image.height > 12_000_000:
        raise ValueError('Image exceeds 12 megapixels')
    pixels = np.asarray(image, dtype=np.float64)
    lum = (pixels[:,:,0]*.299 + pixels[:,:,1]*.587 + pixels[:,:,2]*.114)*pixels[:,:,3]/(255*255)
    height, width = lum.shape
    sx = np.clip((np.arange(128)+.5)*width/128-.5, 0, width-1)
    sy = np.clip((np.arange(128)+.5)*height/128-.5, 0, height-1)
    x0,y0 = np.floor(sx).astype(int),np.floor(sy).astype(int)
    x1,y1 = np.minimum(x0+1,width-1),np.minimum(y0+1,height-1)
    dx,dy = sx-x0,sy-y0
    out = (lum[y0[:,None],x0]*(1-dx)*(1-dy[:,None]) + lum[y0[:,None],x1]*dx*(1-dy[:,None]) + lum[y1[:,None],x0]*(1-dx)*dy[:,None] + lum[y1[:,None],x1]*dx*dy[:,None])
    return out.astype(np.float32)[None,:,:]

def read_manifest(manifest, root):
    root = Path(root).resolve()
    with Path(manifest).open(newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        if set(reader.fieldnames or []) != {'path','label','patient_id','split'}:
            raise ValueError('CSV columns must be path,label,patient_id,split')
        rows = list(reader)
    if not rows:
        raise ValueError('Dataset manifest is empty')
    patients,paths,hashes = {},set(),{}
    import hashlib
    for r in rows:
        if r['label'] not in CLASSES or r['split'] not in ['train','val','test'] or not r['patient_id'].strip():
            raise ValueError('Invalid label, split or missing patient ID')
        path = (root/r['path']).resolve()
        if not path.is_relative_to(root) or not path.is_file() or path.suffix.lower() not in ['.jpg','.jpeg','.png','.webp']:
            raise ValueError('Invalid dataset path')
        if path in paths:
            raise ValueError('Repeated image path')
        paths.add(path)
        previous = patients.setdefault(r['patient_id'],r['split'])
        if previous != r['split']:
            raise ValueError('Patient leakage across dataset splits')
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        old = hashes.setdefault(digest,(r['split'],r['label']))
        if old != (r['split'],r['label']):
            raise ValueError('Duplicate image crosses splits or has conflicting labels')
        r['file'] = path
    for split in ['train','val','test']:
        if {r['label'] for r in rows if r['split']==split} != set(CLASSES):
            raise ValueError(f'Every class must be represented in {split}')
    return rows
