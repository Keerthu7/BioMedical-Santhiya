import csv,tempfile,unittest
from pathlib import Path
from common import CLASSES,read_manifest
class ManifestTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='manifest-test-',dir=Path(__file__).resolve().parent)
        self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name);self.rows=[]
        for split in ['train','val','test']:
            for label in CLASSES:
                name=f'{split}-{label}.png';(self.root/name).write_bytes(name.encode())
                self.rows.append({'path':name,'patient_id':name,'label':label,'split':split})
    def write(self):
        path=self.root/'manifest.csv'
        with path.open('w',newline='') as handle:
            writer=csv.DictWriter(handle,fieldnames=['path','patient_id','label','split']);writer.writeheader();writer.writerows(self.rows)
        return path
    def test_valid_patient_separated_manifest(self):self.assertEqual(len(read_manifest(self.write(),self.root)),12)
    def test_patient_overlap_rejected(self):
        self.rows[4]['patient_id']=self.rows[0]['patient_id']
        with self.assertRaisesRegex(ValueError,'Duplicate|[Pp]atient'):read_manifest(self.write(),self.root)
    def test_duplicate_bytes_rejected(self):
        (self.root/self.rows[4]['path']).write_bytes((self.root/self.rows[0]['path']).read_bytes())
        with self.assertRaisesRegex(ValueError,'Duplicate'):read_manifest(self.write(),self.root)
    def test_missing_class_rejected(self):
        self.rows=self.rows[:-1]
        with self.assertRaisesRegex(ValueError,'class'):read_manifest(self.write(),self.root)
if __name__=='__main__':unittest.main()

