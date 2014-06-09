require_relative "spec_helper"
require_relative "../keenio_introduction.rb"

def app
  KeenioIntroduction
end

describe KeenioIntroduction do
  it "responds with a welcome message" do
    get '/'

    last_response.body.must_include 'Welcome to the Sinatra Template!'
  end
end
