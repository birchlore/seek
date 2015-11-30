class Users::SessionsController < Devise::SessionsController


  def destroy
    binding.pry
    cookies.delete(:auth_token)
    flash[:notice] = "Successfully Logged Out"
    redirect_to new_session_path
  end

end