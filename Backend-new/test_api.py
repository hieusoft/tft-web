import urllib.request
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

endpoints = [
    'traits',
    'augments',
    'items',
    'skills',
    'champions',
    'gods',
    'comps'
]

base_url = 'http://127.0.0.1:8000/api/v1/'

for ep in endpoints:
    url = base_url + ep + '/'
    print(f'\n--- Testing {ep.upper()} ---')
    print(f'GET {url}')
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            print(f'   Success! Found {len(data)} records.')
            
            if data:
                first_item = data[0]
                ident = first_item.get('slug')
                if not ident:
                    ident = first_item.get('id')
                
                if ident is not None:
                    detail_url = f'{base_url}{ep}/{ident}'
                    print(f'GET {detail_url}')
                    req_detail = urllib.request.Request(detail_url)
                    try:
                        with urllib.request.urlopen(req_detail) as res_detail:
                            detail_data = json.loads(res_detail.read().decode('utf-8'))
                            print(f'   Detail fetched successfully.')
                    except Exception as edet:
                        print(f'   [ERROR] Detail fetch failed: {edet}')
                        if hasattr(edet, 'read'):
                            err_text = edet.read().decode('utf-8')
                            print(f'   [DETAIL] {err_text}')
    except Exception as e:
        print(f'   [ERROR] Listing failed: {e}')
        if hasattr(e, 'read'):
            err_text = e.read().decode('utf-8')
            print(f'   [DETAIL] {err_text}')
