class MessagesController < ApplicationController
  before_filter :authenticate_user!

  def index
    @received_messages = current_user.received_messages
    @sent_messages = current_user.sent_messages
  end


  def new
  end

  def create
    @sender = current_user
    @receiver = User.find(params[:receiver])
    @sender.send_message(@receiver,params[:message], params[:subject])

    respond_to do |format|
      format.json { head :ok }
    end
    
  end

  def show
  end



end
