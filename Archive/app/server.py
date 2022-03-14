import cherrypy
from haiku_laureate import generate_haiku_for_address

class Root(object):
  @cherrypy.expose
  def index(self):
    return u"Haiku Laureate"

  @cherrypy.expose
  def default(self, *args, **kwargs):
    cherrypy.response.headers['Access-Control-Allow-Origin'] =  'http://www.frontiernerds.com';
    cherrypy.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    return generate_haiku_for_address(args[0], 1)

# Start the server
cherrypy.config.update({'server.socket_host': '0.0.0.0', 'server.socket_port': 80})
cherrypy.tree.mount(Root())