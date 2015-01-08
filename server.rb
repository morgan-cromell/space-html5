require "sinatra"
require "sinatra/reloader"


set :public_folder, 'test'
set :bind, "0.0.0.0"
set :port, 80
get "/" do

	redirect 'index.html'
end