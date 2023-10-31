import redis

class MyAddon:
    def __init__(self):
        self.r = redis.Redis(host='localhost', port=6379, db=0)

    def response(self, flow):
        urls = [url.decode('utf-8') for url in self.r.lrange('override:urls', 0, -1)]
        data = [self.r.hgetall(f'override:{url}') for url in urls]

        match = None
        for node in data:
            print(flow.request.url, node[b'urlMatch'].decode('utf-8'), node[b'urlMatch'].decode('utf-8') in flow.request.url)
            if b'enabled' in node and node[b'enabled'] == b'true' and node[b'urlMatch'].decode('utf-8') in flow.request.url:
                print(node[b'urlMatch'].decode('utf-8') in flow.request.url)
                print(node[b'urlMatch'])
                print(flow.request.url)
                match = node
                break

        if match is not None and flow.request.method != 'OPTIONS' and (b'method' not in match or match[b'method'].decode('utf-8') == flow.request.method):
            print('match!', flow.request.url)
            flow.response.status_code = int(match[b'statusCode'])
            if b'body' in match:
                flow.response.content = match[b'body']

addons = [MyAddon()]






