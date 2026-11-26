"""Train, test and export a real CNN from a supplied labelled dataset.
No medical weights or fabricated dataset are bundled with this project.
"""
import argparse,hashlib,json,random
from pathlib import Path
from common import CLASSES,read_manifest,preprocess

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--data-root',required=True)
    parser.add_argument('--output',default='dist/model')
    parser.add_argument('--epochs',type=int,default=30)
    parser.add_argument('--batch-size',type=int,default=16)
    parser.add_argument('--review-threshold',type=float,default=.7)
    args=parser.parse_args()
    if args.epochs<1 or args.batch_size<1 or not .25<=args.review_threshold<=1:
        parser.error('Invalid epochs, batch size or review threshold')
    rows=read_manifest(args.manifest,args.data_root)
    import numpy as np
    import torch
    from torch import nn
    from PIL import Image
    from sklearn.metrics import accuracy_score,precision_recall_fscore_support,confusion_matrix
    random.seed(42);np.random.seed(42);torch.manual_seed(42)
    class Dataset(torch.utils.data.Dataset):
        def __init__(self,split):self.rows=[r for r in rows if r['split']==split]
        def __len__(self):return len(self.rows)
        def __getitem__(self,index):
            r=self.rows[index]
            with Image.open(r['file']) as image:x=preprocess(image)
            return torch.from_numpy(x),CLASSES.index(r['label'])
    def make_model():
        return nn.Sequential(nn.Conv2d(1,16,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),nn.Conv2d(16,32,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),nn.Conv2d(32,64,3,padding=1),nn.ReLU(),nn.AdaptiveAvgPool2d(1),nn.Flatten(),nn.Linear(64,4))
    loaders={s:torch.utils.data.DataLoader(Dataset(s),batch_size=args.batch_size,shuffle=s=='train',num_workers=0) for s in ['train','val','test']}
    model=make_model();optimizer=torch.optim.Adam(model.parameters(),lr=.001);criterion=nn.CrossEntropyLoss()
    output=Path(args.output);output.mkdir(parents=True,exist_ok=True)
    # A previous model is disabled while a replacement is being trained/exported.
    (output/'manifest.json').write_text(json.dumps({'schema':1,'ready':False,'reason':'training_in_progress'}))
    best=float('inf');history=[]
    for epoch in range(args.epochs):
        model.train();loss_sum=count=0
        for x,y in loaders['train']:
            optimizer.zero_grad();loss=criterion(model(x),y);loss.backward();optimizer.step()
            loss_sum+=loss.item()*len(y);count+=len(y)
        model.eval();val_sum=val_count=0
        with torch.no_grad():
            for x,y in loaders['val']:
                val_sum+=criterion(model(x),y).item()*len(y);val_count+=len(y)
        validation=val_sum/val_count;history.append({'epoch':epoch+1,'train_loss':loss_sum/count,'validation_loss':validation})
        if validation<best:
            best=validation;torch.save(model.state_dict(),output/'best-state.pt')
        print(json.dumps(history[-1]))
    model.load_state_dict(torch.load(output/'best-state.pt',map_location='cpu',weights_only=True));model.eval()
    y_true=[];y_pred=[]
    with torch.no_grad():
        for x,y in loaders['test']:
            y_true.extend(y.tolist());y_pred.extend(model(x).argmax(1).tolist())
    precision,recall,f1,support=precision_recall_fscore_support(y_true,y_pred,labels=range(4),zero_division=0)
    metrics={'classes':CLASSES,'test_count':len(y_true),'accuracy':accuracy_score(y_true,y_pred),'precision':precision.tolist(),'recall':recall.tolist(),'f1':f1.tolist(),'support':support.tolist(),'confusion_matrix':confusion_matrix(y_true,y_pred,labels=range(4)).tolist(),'macro_f1':float(f1.mean()),'clinical_validation':False}
    (output/'metrics.json').write_text(json.dumps(metrics,indent=2));(output/'training-history.json').write_text(json.dumps(history,indent=2))
    (output/'test-predictions.json').write_text(json.dumps({'reference':y_true,'predicted':y_pred}))
    artifact=output/'brain-mri.onnx'
    torch.onnx.export(model,(torch.zeros(1,1,128,128),),str(artifact),input_names=['image'],output_names=['logits'],opset_version=18,dynamo=True,external_data=False)
    import onnxruntime as ort
    session=ort.InferenceSession(str(artifact),providers=['CPUExecutionProvider'])
    check=np.random.default_rng(42).random((1,1,128,128),dtype=np.float32)
    with torch.no_grad():expected=model(torch.from_numpy(check)).numpy()
    actual=session.run(['logits'],{'image':check})[0]
    np.testing.assert_allclose(actual,expected,rtol=1e-4,atol=1e-5)
    manifest={'schema':1,'ready':True,'version':hashlib.sha256(artifact.read_bytes()).hexdigest()[:12],'file':artifact.name,'sha256':hashlib.sha256(artifact.read_bytes()).hexdigest(),'classes':CLASSES,'inputName':'image','outputName':'logits','width':128,'height':128,'channels':1,'layout':'NCHW','normalization':'rgb_luma_bilinear_0_1_v1','reviewThreshold':args.review_threshold,'clinicalValidation':False,'testMetrics':'metrics.json','thresholdNote':'Project review threshold; not a clinically validated decision rule.'}
    temporary=output/'manifest.tmp';temporary.write_text(json.dumps(manifest,indent=2));temporary.replace(output/'manifest.json')
    print('Export complete. Install the browser runtime, verify browser inference and review held-out metrics before deployment.')
if __name__=='__main__':main()
