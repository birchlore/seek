class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
  end

  def create
  end

  def new
  end

  def update
    current_user.avatar = user_params[:avatar]
    current_user.save
    respond_to do |format|
      format.json { head :ok }
      format.html { redirect_to request.referer }
    end
  end

  def edit
  end

  def show
  end

  private

  def user_params
    params.require(:user).permit(
      :avatar)
  end

end
