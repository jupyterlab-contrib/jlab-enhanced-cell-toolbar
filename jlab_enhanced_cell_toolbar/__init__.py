
import json
import pathlib

from ._version import __version__

HERE = pathlib.Path(__file__).parent.resolve()

with (HERE / 'labextension' / 'package.json').open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': data['name']
    }]



