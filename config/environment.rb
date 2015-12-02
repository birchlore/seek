# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Rails.application.initialize!

Split::Dashboard.use Rack::Auth::Basic do |username, password|
  username == 'admin' && password == 'Janky123?'
end

